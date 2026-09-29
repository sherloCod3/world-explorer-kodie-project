/**
 * Testes do utilitário de condições (conditions.ts).
 *
 * Cobertura:
 * - Sucesso com geocoding da capital (coordenadas, fuso, clima e sol)
 * - Preferência pelo resultado que casa com o alfa-2 do país
 * - Fallback para o centro do país (sem geocoding ou geocoding falho)
 * - Sem localização e payload de previsão inválido
 * - Tempo limite
 * - Tradução dos códigos meteorológicos WMO
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  describeWeather,
  fetchCountryConditions,
} from '../../utils/conditions';
import type { Country } from '../../types/country';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

/** País de base para os testes (sem chamar a API real). */
const brazil: Country = {
  name: { common: 'Brasil', official: 'Brasil' },
  cca3: 'BRA',
  cca2: 'BR',
  region: 'Americas',
  population: 214326223,
  area: 8515767,
  flags: { png: '', svg: '' },
  capital: ['Brasília'],
  languages: {},
  currencies: {},
  latlng: [-10, -55],
  timezones: [],
  flag: '',
};

/** Resposta de sucesso do geocoding. */
const geocodeHit = {
  results: [
    {
      latitude: -15.78,
      longitude: -47.93,
      country_code: 'BR',
      timezone: 'America/Sao_Paulo',
    },
  ],
};

/** Resposta de sucesso da previsão. */
const forecast = {
  timezone: 'America/Sao_Paulo',
  current: {
    temperature_2m: 27.4,
    weather_code: 2,
    relative_humidity_2m: 60,
    wind_speed_10m: 12.3,
  },
  daily: {
    sunrise: ['2026-09-29T06:12'],
    sunset: ['2026-09-29T18:30'],
  },
};

/** Simula uma resposta HTTP bem-sucedida. */
function respondWith(payload: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(payload),
  });
}

describe('conditions - fetchCountryConditions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('usou a capital pelo geocoding e retornou o clima completo', async () => {
    respondWith(geocodeHit);
    respondWith(forecast);

    const conditions = await fetchCountryConditions(brazil);

    expect(conditions.place).toBe('Brasília');
    expect(conditions.isCapital).toBe(true);
    expect(conditions.timezone).toBe('America/Sao_Paulo');
    expect(conditions.temperatureC).toBe(27.4);
    expect(conditions.weatherCode).toBe(2);
    expect(conditions.humidity).toBe(60);
    expect(conditions.windKmh).toBe(12.3);
    expect(conditions.sunrise).toBe('2026-09-29T06:12');
    expect(conditions.sunset).toBe('2026-09-29T18:30');

    // A previsão usou as coordenadas da capital, não o centro do país.
    const forecastUrl = mockFetch.mock.calls[1][0] as string;
    expect(forecastUrl).toContain('latitude=-15.78&longitude=-47.93');
    expect(forecastUrl).toContain('timezone=auto');
  });

  it('preferiu o resultado do país correto quando há homônimos', async () => {
    respondWith({
      results: [
        { latitude: 1, longitude: 1, country_code: 'US' },
        { latitude: 2, longitude: 2, country_code: 'BR' },
      ],
    });
    respondWith(forecast);

    await fetchCountryConditions(brazil);

    const forecastUrl = mockFetch.mock.calls[1][0] as string;
    expect(forecastUrl).toContain('latitude=2&longitude=2');
  });

  it('caiu para o centro do país quando o geocoding não encontra a capital', async () => {
    respondWith({});
    respondWith(forecast);

    const conditions = await fetchCountryConditions(brazil);

    expect(conditions.place).toBe('Centro do país');
    expect(conditions.isCapital).toBe(false);

    const forecastUrl = mockFetch.mock.calls[1][0] as string;
    expect(forecastUrl).toContain('latitude=-10&longitude=-55');
  });

  it('caiu para o centro do país quando o geocoding falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
    respondWith(forecast);

    const conditions = await fetchCountryConditions(brazil);

    expect(conditions.place).toBe('Centro do país');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('lançou erro quando o país não tem localização conhecida', async () => {
    const withoutLocation: Country = {
      ...brazil,
      capital: undefined,
      latlng: [],
    };

    await expect(fetchCountryConditions(withoutLocation)).rejects.toThrow(
      'Localização indisponível para este país.',
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('lançou erro quando a previsão vem sem temperatura', async () => {
    respondWith(geocodeHit);
    respondWith({ timezone: 'America/Sao_Paulo', current: {} });

    await expect(fetchCountryConditions(brazil)).rejects.toThrow(
      'Clima indisponível no momento.',
    );
  });

  it('interrompeu a requisição ao exceder o tempo limite', async () => {
    const withoutCapital: Country = { ...brazil, capital: undefined };

    vi.useFakeTimers();
    try {
      mockFetch.mockImplementationOnce(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const abortError = new Error('Aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }),
      );

      const promise = fetchCountryConditions(withoutCapital);
      // Handler anexado antes de avançar o tempo para não gerar rejeição solta.
      const assertion = expect(promise).rejects.toThrow(
        'Tempo limite ao buscar o clima.',
      );

      await vi.advanceTimersByTimeAsync(15001);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('conditions - describeWeather', () => {
  it('traduziu os códigos WMO mais comuns', () => {
    expect(describeWeather(0)).toBe('Céu limpo');
    expect(describeWeather(2)).toBe('Parcialmente nublado');
    expect(describeWeather(45)).toBe('Névoa');
    expect(describeWeather(61)).toBe('Chuva');
    expect(describeWeather(75)).toBe('Neve');
    expect(describeWeather(95)).toBe('Tempestade');
    expect(describeWeather(99)).toBe('Tempestade com granizo');
  });

  it('retornou undefined para código desconhecido (nada é inventado)', () => {
    expect(describeWeather(123)).toBeUndefined();
    expect(describeWeather(-1)).toBeUndefined();
  });
});