/**
 * Condições atuais de um país: localização, fuso horário e clima.
 *
 * Fontes (ambas gratuitas, sem API key e com CORS `*` — verificadas ao vivo
 * em 29/09/2026):
 * - Geocoding: https://geocoding-api.open-meteo.com/v1/search
 *   Devolve coordenadas da capital e o fuso IANA correto (com horário de verão).
 * - Previsão: https://api.open-meteo.com/v1/forecast
 *   Devolve clima atual, umidade, vento e nascer/pôr do sol em uma chamada.
 *
 * Fallback honesto: sem capital, sem resultado no geocoding ou sem geocoding,
 * usa o centro do país (campo latlng) e rotula o local como "Centro do país",
 * para nunca exibir clima de um lugar que não é o país pedido.
 */
import type { Country } from '../types/country';
import type { Conditions } from '../types/travel';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Mesmo limite aplicado às requisições da aplicação. */
const REQUEST_TIMEOUT_MS = 15000;

/** Rótulo usado quando a capital não pode ser localizada. */
const CENTRAL_PLACE = 'Centro do país';

const TIMEOUT_MESSAGE = 'Tempo limite ao buscar o clima.';
const UNAVAILABLE_MESSAGE = 'Clima indisponível no momento.';
const LOCATION_MESSAGE = 'Localização indisponível para este país.';

/** Resultado útil do geocoding. */
interface GeocodeHit {
  latitude: number;
  longitude: number;
  country_code?: string;
  timezone?: string;
}

/** Identifica falha por tempo limite (AbortController). */
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'AbortError'
  );
}

/** Devolve o valor como número finito, ou undefined. */
function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Devolve o valor como texto não vazio, ou undefined. */
function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

/** GET com tempo limite; devolve o JSON ou lança erro legível ao usuário. */
async function requestJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) throw new Error(UNAVAILABLE_MESSAGE);

    try {
      return await response.json();
    } catch (parseError) {
      // Falha original preservada para depuração, sem exibi-la ao usuário.
      throw new Error(UNAVAILABLE_MESSAGE, { cause: parseError });
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(TIMEOUT_MESSAGE, { cause: error });
    }
    throw error instanceof Error ? error : new Error(UNAVAILABLE_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Confirma que o item do geocoding tem coordenadas válidas. */
function isGeocodeHit(item: unknown): item is GeocodeHit {
  if (typeof item !== 'object' || item === null) return false;
  const hit = item as Record<string, unknown>;
  return typeof hit.latitude === 'number' && typeof hit.longitude === 'number';
}

/**
 * Localiza a capital informada.
 * Com o código alfa-2 do país, prefere o resultado que casa com o país certo
 * (ex.: "Georgetown" existe em vários lugares); senão, usa o primeiro.
 * Retorna null quando nada é encontrado.
 */
async function geocodeCapital(
  capital: string,
  cca2?: string,
): Promise<GeocodeHit | null> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(capital)}&count=5&language=pt&format=json`;
  const data = await requestJson(url);

  const results = (data as { results?: unknown }).results;
  if (!Array.isArray(results)) return null;

  const hits = results.filter(isGeocodeHit);
  if (hits.length === 0) return null;

  const match = cca2
    ? hits.find((hit) => hit.country_code === cca2)
    : undefined;
  return match ?? hits[0];
}

/**
 * Traduz o código meteorológico WMO (usado pelo Open-Meteo) para pt-BR.
 * Referência: documentação do Open-Meteo, "Weather interpretation codes".
 * Retorna undefined para códigos desconhecidos — nada é inventado.
 */
export function describeWeather(code: number): string | undefined {
  switch (code) {
    case 0:
      return 'Céu limpo';
    case 1:
      return 'Predominantemente limpo';
    case 2:
      return 'Parcialmente nublado';
    case 3:
      return 'Nublado';
    case 45:
    case 48:
      return 'Névoa';
    case 51:
    case 53:
    case 55:
      return 'Chuvisco';
    case 56:
    case 57:
      return 'Chuvisco congelante';
    case 61:
    case 63:
    case 65:
      return 'Chuva';
    case 66:
    case 67:
      return 'Chuva congelante';
    case 71:
    case 73:
    case 75:
      return 'Neve';
    case 77:
      return 'Grãos de neve';
    case 80:
    case 81:
    case 82:
      return 'Pancadas de chuva';
    case 85:
    case 86:
      return 'Pancadas de neve';
    case 95:
      return 'Tempestade';
    case 96:
    case 99:
      return 'Tempestade com granizo';
    default:
      return undefined;
  }
}

/**
 * Valida e converte a resposta da previsão em Condições.
 * Exige temperatura e código de tempo: sem eles o cartão não informa nada útil.
 */
function parseForecast(data: unknown): Omit<Conditions, 'place' | 'isCapital'> {
  const payload = data as {
    timezone?: unknown;
    current?: unknown;
    daily?: unknown;
  };
  const current = payload.current as Record<string, unknown> | undefined;
  const daily = payload.daily as Record<string, unknown> | undefined;

  const temperatureC = asNumber(current?.temperature_2m);
  const weatherCode = asNumber(current?.weather_code);

  if (temperatureC === undefined || weatherCode === undefined) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  const firstOf = (value: unknown): string | undefined =>
    Array.isArray(value) ? asText(value[0]) : undefined;

  return {
    timezone: asText(payload.timezone),
    temperatureC,
    weatherCode,
    humidity: asNumber(current?.relative_humidity_2m),
    windKmh: asNumber(current?.wind_speed_10m),
    sunrise: firstOf(daily?.sunrise),
    sunset: firstOf(daily?.sunset),
  };
}

/**
 * Busca as condições do país: geocoding da capital (melhor esforço) e previsão.
 * Falha no geocoding cai para o centro do país; falha na previsão propaga o
 * erro, para a interface exibir "Clima indisponível".
 */
export async function fetchCountryConditions(
  country: Country,
): Promise<Conditions> {
  const capital = country.capital?.[0];
  let hit: GeocodeHit | null = null;

  if (capital) {
    try {
      hit = await geocodeCapital(capital, country.cca2);
    } catch {
      // Geocoding indisponível: tenta o centro do país antes de desistir.
      hit = null;
    }
  }

  const latitude = hit ? hit.latitude : country.latlng[0];
  const longitude = hit ? hit.longitude : country.latlng[1];

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(LOCATION_MESSAGE);
  }

  const forecastUrl =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    '&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m' +
    '&daily=sunrise,sunset&timezone=auto&forecast_days=1';

  const conditions = parseForecast(await requestJson(forecastUrl));

  return {
    ...conditions,
    place: hit && capital ? capital : CENTRAL_PLACE,
    isCapital: Boolean(hit && capital),
    timezone: conditions.timezone ?? hit?.timezone,
  };
}
