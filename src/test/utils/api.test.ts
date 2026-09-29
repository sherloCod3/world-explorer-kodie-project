/**
 * Testes do módulo de API.
 *
 * Cobertura:
 * - fetchAllCountries: busca bem-sucedida e tratamento de erro
 * - searchCountries: busca por nome, 404 e erro
 * - fetchCountryByCode: busca por código e erro
 *
 * Utiliza mock do fetch para simular respostas da API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchAllCountries,
  searchCountries,
  fetchCountryByCode,
  REQUEST_TIMEOUT_MS,
} from '../../utils/api';
import { REGIONS } from '../../utils/regions';

// Mock global do fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('API - fetchAllCountries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou lista de países com sucesso', async () => {
    const mockData = [
      { name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 },
      { name: 'Argentina', alpha3Code: 'ARG', region: 'Americas', population: 44000000 },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchAllCountries();
    expect(result).toHaveLength(2);
    expect(result[0].name.common).toBe('Brasil');
    expect(result[0].cca3).toBe('BRA');
  });

  it('lançou erro quando resposta não foi OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchAllCountries()).rejects.toThrow('Erro ao buscar países: 500');
  });
});

describe('API - searchCountries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou resultados da busca', async () => {
    const mockData = [{ name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await searchCountries('Brasil');
    expect(result).toHaveLength(1);
    expect(result[0].name.common).toBe('Brasil');
    expect(result[0].cca3).toBe('BRA');
  });

  it('retornou array vazio quando país não encontrado (404)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await searchCountries('PaísInexistente');
    expect(result).toEqual([]);
  });

  it('lançou erro para outros status de erro', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    await expect(searchCountries('Test')).rejects.toThrow('Erro na busca: 503');
  });
});

describe('API - fetchCountryByCode', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou país pelo código', async () => {
    const mockData = [{ name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchCountryByCode('BRA');
    expect(result.name.common).toBe('Brasil');
    expect(result.cca3).toBe('BRA');
  });

  it('lançou erro quando país não encontrado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchCountryByCode('XXX')).rejects.toThrow('País não encontrado: XXX');
  });
});

describe('API - contrato de mapeamento do countries.dev', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  /** Amostra real da API: país sem fronteiras (Bolívia). */
  const apiCountry = {
    name: 'Bolivia',
    nativeName: 'Bolivia',
    alpha2Code: 'BO',
    alpha3Code: 'BOL',
    numericCode: '068',
    region: 'Americas',
    subregion: 'South America',
    population: 11673021,
    area: 1098581,
    flags: {
      png: 'https://flagcdn.com/w320/bo.png',
      svg: 'https://flagcdn.com/bo.svg',
    },
    capital: 'Sucre',
    languages: [{ name: 'Spanish', iso639_1: 'es', nativeName: 'Español' }],
    currencies: [{ code: 'BOB', name: 'Bolivian boliviano', symbol: 'Bs.' }],
    latlng: [-17, -65],
    timezones: ['UTC-04:00'],
    independent: true,
    flag: '🇧🇴',
  };

  /** Simula uma resposta bem-sucedida da API com o payload informado. */
  function mockList(payload: unknown) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });
  }

  it('converteu o formato achatado da API no tipo Country', async () => {
    mockList([apiCountry]);

    const [country] = await fetchAllCountries();

    expect(country.name.common).toBe('Bolivia');
    expect(country.name.nativeName).toBe('Bolivia');
    expect(country.cca3).toBe('BOL');
    expect(country.cca2).toBe('BO');
    expect(country.ccn3).toBe('068');
    expect(country.region).toBe('Americas');
    expect(country.subregion).toBe('South America');
    expect(country.capital).toEqual(['Sucre']);
    expect(country.languages).toEqual({ es: 'Spanish' });
    expect(country.currencies).toEqual({
      BOB: { name: 'Bolivian boliviano', symbol: 'Bs.' },
    });
    expect(country.flags.svg).toBe('https://flagcdn.com/bo.svg');
    expect(country.latlng).toEqual([-17, -65]);
    expect(country.timezones).toEqual(['UTC-04:00']);
    expect(country.independent).toBe(true);
    expect(country.flag).toBe('🇧🇴');
  });

  it('não criou valores fixos para campos que a API não fornece', async () => {
    mockList([apiCountry]);

    const [country] = await fetchAllCountries();

    // Campos não fornecidos ficam indefinidos para a interface não exibir
    // informação incorreta (antes eram fixados como false/[]).
    expect(country.landlocked).toBeUndefined();
    expect(country.unMember).toBeUndefined();
    expect(country.continents).toBeUndefined();
    expect(country.startOfWeek).toBeUndefined();
    expect(country.coatOfArms).toBeUndefined();
  });

  it('normalizou regiões fora do padrão usado no filtro', async () => {
    mockList([
      { name: 'Antarctica', alpha3Code: 'ATA', region: 'Polar' },
      { name: 'Bouvet Island', alpha3Code: 'BVT', region: 'Antarctic Ocean' },
      { name: 'Japan', alpha3Code: 'JPN', region: 'Asia' },
    ]);

    const countries = await fetchAllCountries();

    expect(countries[0].region).toBe('Antarctic');
    expect(countries[1].region).toBe('Antarctic');
    expect(countries[2].region).toBe('Asia');
  });

  it('devolveu apenas regiões que o filtro consegue selecionar', async () => {
    mockList([
      { name: 'Antarctica', alpha3Code: 'ATA', region: 'Polar' },
      { name: 'Bouvet Island', alpha3Code: 'BVT', region: 'Antarctic Ocean' },
      { name: 'Brazil', alpha3Code: 'BRA', region: 'Americas' },
    ]);

    const countries = await fetchAllCountries();

    for (const country of countries) {
      expect(REGIONS as readonly string[]).toContain(country.region);
    }
  });

  it('tratou campos ausentes sem quebrar', async () => {
    mockList([{ name: 'Antarctica', alpha3Code: 'ATA', region: 'Polar' }]);

    const [country] = await fetchAllCountries();

    expect(country.capital).toBeUndefined();
    expect(country.area).toBe(0);
    expect(country.subregion).toBeUndefined();
    expect(country.borders).toEqual([]);
    expect(country.timezones).toEqual([]);
    expect(country.latlng).toEqual([]);
    expect(country.languages).toEqual({});
    expect(country.currencies).toEqual({});
    expect(country.ccn3).toBeUndefined();
  });

  it('aceitou capital em lista e converteu moeda sem símbolo', async () => {
    mockList([
      {
        name: 'South Africa',
        alpha3Code: 'ZAF',
        region: 'Africa',
        capital: ['Pretoria', 'Cape Town', 'Bloemfontein'],
        currencies: [{ code: 'ZAR', name: 'South African rand' }],
      },
    ]);

    const [country] = await fetchAllCountries();

    expect(country.capital).toHaveLength(3);
    expect(country.currencies.ZAR).toEqual({
      name: 'South African rand',
      symbol: '',
    });
  });
});

describe('API - falhas de comunicação', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('rejeitou resposta com objetos vazios (campo inválido em fields)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{}, {}]),
    });

    await expect(fetchAllCountries()).rejects.toThrow(
      'Resposta inválida da API de países.',
    );
  });

  it('rejeitou resposta que não é JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(fetchAllCountries()).rejects.toThrow(
      'Resposta inválida da API de países.',
    );
  });

  it('devolveu lista vazia quando a API não retorna países', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await expect(fetchAllCountries()).resolves.toEqual([]);
  });

  it('enviou sinal de cancelamento para limitar o tempo de espera', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchAllCountries();

    const [, init] = mockFetch.mock.calls[0];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('interrompeu a requisição ao exceder o tempo limite', async () => {
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

      const promise = fetchAllCountries();
      // Handler anexado antes de avançar o tempo para não gerar rejeição solta.
      const assertion = expect(promise).rejects.toThrow('Tempo limite excedido');

      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
