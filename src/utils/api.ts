/**
 * Módulo de comunicação com a API de países.
 * Centraliza todas as chamadas HTTP e tratamento de erros.
 *
 * API utilizada: https://countries.dev
 * - Gratuita, sem necessidade de autenticação
 * - CORS habilitado (Access-Control-Allow-Origin: *)
 * - Retorna dados completos de todos os países
 */
import type { Country } from '../types/country';

const BASE_URL = 'https://countries.dev';

/** Campos para manter o payload mínimo. */
const FIELDS =
  'name,alpha3Code,region,subregion,population,area,flags,capital,languages,currencies,latlng,borders,independent,timezones,flag';

/**
 * Mapeia o formato de resposta do countries.dev para o tipo Country da aplicação.
 * O countries.dev usa campos achatados (name: string, alpha3Code, languages[]).
 */
function mapCountry(raw: Record<string, unknown>): Country {
  const languages: Record<string, string> = {};
  const rawLanguages = (raw.languages as Array<{ name?: string; iso639_1?: string }>) ?? [];
  for (const lang of rawLanguages) {
    if (lang.iso639_1 && lang.name) {
      languages[lang.iso639_1] = lang.name;
    }
  }

  const currencies: Record<string, { name: string; symbol: string }> = {};
  const rawCurrencies = (raw.currencies as Array<{ code?: string; name?: string; symbol?: string }>) ?? [];
  for (const curr of rawCurrencies) {
    if (curr.code) {
      currencies[curr.code] = { name: curr.name ?? '', symbol: curr.symbol ?? '' };
    }
  }

  const flags = raw.flags as { png?: string; svg?: string } | undefined;

  return {
    name: {
      common: (raw.name as string) ?? '',
      official: (raw.name as string) ?? '',
      nativeName: raw.nativeName as Country['name']['nativeName'] ?? undefined,
    },
    cca3: (raw.alpha3Code as string) ?? '',
    region: (raw.region as string) ?? '',
    subregion: raw.subregion as string | undefined,
    population: (raw.population as number) ?? 0,
    area: (raw.area as number) ?? 0,
    flags: {
      png: flags?.png ?? '',
      svg: flags?.svg ?? '',
      alt: undefined,
    },
    capital: raw.capital
      ? [raw.capital as string]
      : (raw.capital as string[] | undefined),
    languages,
    currencies,
    latlng: ((raw.latlng as [number, number]) ?? [0, 0]) as number[],
    borders: (raw.borders as string[]) ?? [],
    independent: raw.independent as boolean | undefined,
    unMember: undefined,
    landlocked: false,
    continents: [],
    timezones: ((raw.timezones as string[]) ?? []) as string[],
    startOfWeek: undefined,
    flag: (raw.flag as string) ?? '',
    ccn3: undefined,
    coatOfArms: undefined,
  };
}

/**
 * Busca todos os países com campos selecionados para otimizar payload.
 * Campos escolhidos cobrem: nome, bandeira, capital, região, população, área, idiomas, moedas.
 */
export async function fetchAllCountries(): Promise<Country[]> {
  const response = await fetch(`${BASE_URL}/countries?fields=${FIELDS}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar países: ${response.status}`);
  }

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(mapCountry);
}

/**
 * Busca países pelo nome (parcial ou completo).
 * Utiliza o endpoint de busca por nome da API.
 */
export async function searchCountries(query: string): Promise<Country[]> {
  const response = await fetch(
    `${BASE_URL}/name/${encodeURIComponent(query)}?fields=${FIELDS}`,
  );

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Erro na busca: ${response.status}`);
  }

  const data = await response.json();
  return (data as Record<string, unknown>[]).map(mapCountry);
}

/**
 * Busca um país específico pelo código alpha3 (CCA3).
 */
export async function fetchCountryByCode(code: string): Promise<Country> {
  const response = await fetch(
    `${BASE_URL}/alpha/${encodeURIComponent(code)}?fields=${FIELDS}`,
  );

  if (!response.ok) {
    throw new Error(`País não encontrado: ${code}`);
  }

  const data = await response.json();
  const arr = data as Record<string, unknown>[];
  return mapCountry(arr[0] ?? arr);
}
