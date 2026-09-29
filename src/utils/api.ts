/**
 * Módulo de comunicação com a API de países.
 * Centraliza as chamadas HTTP, o mapeamento das respostas e o tratamento de erros.
 *
 * API utilizada: https://countries.dev
 * - Gratuita e sem autenticação (sem API key)
 * - CORS habilitado (Access-Control-Allow-Origin: *), permite chamada direta do navegador
 * - Formato achatado: name é string, usa alpha3Code, languages[] e currencies[]
 *
 * Contrato de dados (padrão adotado para os campos ausentes):
 * - A API não fornece continents, unMember, landlocked, startOfWeek e coatOfArms.
 * - Esses campos são retornados como undefined e a interface não os exibe.
 *   Nenhum valor fixo é atribuído, para não exibir informação incorreta.
 * - O campo area recebe 0 quando a API não informa o valor (a interface trata 0
 *   como "não informada", pois nenhum país tem área 0 km²).
 * - Regiões são normalizadas para o conjunto suportado pelo filtro (ver utils/regions.ts).
 */
import type { Country, Currency } from '../types/country';
import { normalizeRegion } from './regions';

const BASE_URL = 'https://countries.dev';

/** Campos para manter o payload mínimo, cobrindo tudo o que a interface exibe. */
const FIELDS =
  'name,nativeName,alpha3Code,numericCode,region,subregion,population,area,flags,capital,languages,currencies,latlng,borders,independent,timezones,flag';

/** Tempo máximo de espera pela resposta da API (evita loading infinito). */
export const REQUEST_TIMEOUT_MS = 15000;

/** Mensagem exibida quando a API não responde dentro do tempo limite. */
const TIMEOUT_MESSAGE = 'Tempo limite excedido ao buscar os dados. Tente novamente.';

/** Mensagem exibida quando a resposta não tem o formato esperado. */
const INVALID_PAYLOAD_MESSAGE = 'Resposta inválida da API de países.';

/**
 * Erro que carrega o status HTTP, para cada função montar a mensagem específica.
 * Nunca expõe detalhes internos da requisição ao usuário.
 */
class HttpError extends Error {
  status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Identifica falha por tempo limite (AbortController). */
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'AbortError'
  );
}

/**
 * Valida se o item recebido tem o formato mínimo de país.
 * Protege contra resposta 200 com objetos vazios, que a API devolve quando o
 * parâmetro fields não corresponde a nenhum campo conhecido.
 */
function isCountryRecord(item: unknown): item is Record<string, unknown> {
  if (typeof item !== 'object' || item === null) return false;
  const record = item as Record<string, unknown>;
  // Nome e código precisam ser textos não vazios para o país ser utilizável na UI.
  return asText(record.name) !== undefined && asText(record.alpha3Code) !== undefined;
}

/** Normaliza a resposta em uma lista de registros válidos. */
function toCountryList(data: unknown): Record<string, unknown>[] {
  const list = Array.isArray(data) ? data : [data];
  const valid = list.filter(isCountryRecord);
  if (list.length > 0 && valid.length === 0) {
    throw new Error(INVALID_PAYLOAD_MESSAGE);
  }
  return valid;
}

/**
 * Executa GET e devolve a lista de países já validada.
 * Aplica tempo limite e converte falhas em mensagens legíveis.
 */
async function requestCountryList(url: string): Promise<Record<string, unknown>[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new HttpError(response.status);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch (parseError) {
      // Preserva a falha original para depuração, sem exibi-la ao usuário.
      throw new Error(INVALID_PAYLOAD_MESSAGE, { cause: parseError });
    }

    return toCountryList(data);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isAbortError(error)) throw new Error(TIMEOUT_MESSAGE, { cause: error });
    throw error instanceof Error ? error : new Error('Erro desconhecido');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Converte erro HTTP em mensagem específica da função que fez a chamada.
 * Erros de tempo limite e de formato seguem com a mensagem original.
 */
function asCallerError(error: unknown, prefix: string): Error {
  if (error instanceof HttpError) return new Error(`${prefix}: ${error.status}`);
  return error instanceof Error ? error : new Error('Erro desconhecido');
}

/** Devolve o valor como texto, ou undefined quando ausente/vazio. */
function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

/** Devolve o valor como número finito, ou undefined quando inválido. */
function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Devolve o valor como lista de textos (array vazio quando ausente). */
function asTextList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** Devolve o valor como lista de números (array vazio quando ausente). */
function asNumberList(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === 'number')
    : [];
}

/** Converte languages[] da API em Record<iso639_1, nome>. */
function mapLanguages(value: unknown): Record<string, string> {
  const languages: Record<string, string> = {};
  if (!Array.isArray(value)) return languages;

  for (const item of value) {
    const lang = item as { name?: unknown; iso639_1?: unknown };
    const code = asText(lang?.iso639_1);
    const name = asText(lang?.name);
    if (code && name) languages[code] = name;
  }
  return languages;
}

/** Converte currencies[] da API em Record<code, { name, symbol }>. */
function mapCurrencies(value: unknown): Record<string, Currency> {
  const currencies: Record<string, Currency> = {};
  if (!Array.isArray(value)) return currencies;

  for (const item of value) {
    const curr = item as { code?: unknown; name?: unknown; symbol?: unknown };
    const code = asText(curr?.code);
    if (!code) continue;
    currencies[code] = {
      name: asText(curr?.name) ?? code,
      symbol: asText(curr?.symbol) ?? '',
    };
  }
  return currencies;
}

/**
 * Mapeia o formato de resposta do countries.dev para o tipo Country da aplicação.
 * O countries.dev usa campos achatados (name: string, alpha3Code, languages[]).
 * Campos que a API não fornece são omitidos do retorno (ver cabeçalho do módulo).
 */
function mapCountry(raw: Record<string, unknown>): Country {
  const flags = (raw.flags ?? {}) as { png?: unknown; svg?: unknown };
  const rawCapital = raw.capital;
  const capitalText = asText(rawCapital);

  return {
    name: {
      common: asText(raw.name) ?? '',
      official: asText(raw.name) ?? '',
      // A API retorna nativeName como texto ("Brasil"), diferente do formato antigo.
      nativeName: asText(raw.nativeName),
    },
    cca3: asText(raw.alpha3Code) ?? '',
    ccn3: asText(raw.numericCode),
    region: normalizeRegion(raw.region),
    subregion: asText(raw.subregion),
    population: asNumber(raw.population) ?? 0,
    // 0 indica "não informada pela API" — a interface exibe "Não informada".
    area: asNumber(raw.area) ?? 0,
    flags: {
      png: asText(flags.png) ?? '',
      svg: asText(flags.svg) ?? '',
      alt: undefined,
    },
    capital: Array.isArray(rawCapital)
      ? asTextList(rawCapital)
      : capitalText
        ? [capitalText]
        : undefined,
    languages: mapLanguages(raw.languages),
    currencies: mapCurrencies(raw.currencies),
    latlng: asNumberList(raw.latlng),
    borders: asTextList(raw.borders),
    independent:
      typeof raw.independent === 'boolean' ? raw.independent : undefined,
    timezones: asTextList(raw.timezones),
    flag: asText(raw.flag) ?? '',
  };
}

/**
 * Busca todos os países com campos selecionados para otimizar payload.
 * Campos escolhidos cobrem: nome, bandeira, capital, região, população, área, idiomas, moedas.
 */
export async function fetchAllCountries(): Promise<Country[]> {
  try {
    const data = await requestCountryList(`${BASE_URL}/countries?fields=${FIELDS}`);
    return data.map(mapCountry);
  } catch (error) {
    throw asCallerError(error, 'Erro ao buscar países');
  }
}

/**
 * Busca países pelo nome (parcial ou completo).
 * Utiliza o endpoint de busca por nome da API.
 */
export async function searchCountries(query: string): Promise<Country[]> {
  try {
    const data = await requestCountryList(
      `${BASE_URL}/name/${encodeURIComponent(query)}?fields=${FIELDS}`,
    );
    return data.map(mapCountry);
  } catch (error) {
    // A API responde 404 quando nenhum país corresponde ao nome buscado.
    if (error instanceof HttpError && error.status === 404) return [];
    throw asCallerError(error, 'Erro na busca');
  }
}

/**
 * Busca um país específico pelo código alpha3 (CCA3).
 */
export async function fetchCountryByCode(code: string): Promise<Country> {
  try {
    const data = await requestCountryList(
      `${BASE_URL}/alpha/${encodeURIComponent(code)}?fields=${FIELDS}`,
    );
    const record = data[0];
    if (!record) throw new Error(`País não encontrado: ${code}`);
    return mapCountry(record);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(`País não encontrado: ${code}`, { cause: error });
    }
    throw error instanceof Error ? error : new Error('Erro desconhecido');
  }
}
