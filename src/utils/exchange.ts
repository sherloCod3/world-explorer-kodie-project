/**
 * Cotação de câmbio via ExchangeRate-API (endpoint aberto).
 *
 * API: https://open.er-api.com/v6/latest/{base}
 * - Gratuita, sem API key, CORS `*` (verificado ao vivo em 29/09/2026)
 * - Atualizada uma vez ao dia; a resposta informa `time_last_update_utc`
 * - Responde `Cache-Control: max-age=3600`, então chamadas repetidas dentro
 *   de 1 hora são atendidas pelo cache do navegador, sem nova requisição
 *
 * Padrão: mesmo limite de tempo e mesmas mensagens legíveis da camada de API.
 */
import type { ExchangeRates } from '../types/travel';

const RATES_URL = 'https://open.er-api.com/v6/latest/BRL';

/** Mesmo limite aplicado às requisições da aplicação. */
const REQUEST_TIMEOUT_MS = 15000;

const UNAVAILABLE_MESSAGE = 'Cotação indisponível no momento.';
const TIMEOUT_MESSAGE = 'Tempo limite ao buscar a cotação.';

/** Identifica falha por tempo limite (AbortController). */
function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'AbortError'
  );
}

/** Confirma que rates é um objeto com valores numéricos. */
function isRatesRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value).every((rate) => typeof rate === 'number');
}

/**
 * Busca a cotação de câmbio com base em reais (BRL).
 * Lança erro com mensagem pronta para exibição ao usuário.
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(RATES_URL, { signal: controller.signal });

    if (!response.ok) throw new Error(UNAVAILABLE_MESSAGE);

    let data: unknown;
    try {
      data = await response.json();
    } catch (parseError) {
      // Falha original preservada para depuração, sem exibi-la ao usuário.
      throw new Error(UNAVAILABLE_MESSAGE, { cause: parseError });
    }

    const payload = data as {
      result?: unknown;
      base_code?: unknown;
      rates?: unknown;
      time_last_update_utc?: unknown;
    };

    if (
      payload.result !== 'success' ||
      typeof payload.base_code !== 'string' ||
      !isRatesRecord(payload.rates)
    ) {
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    return {
      base: payload.base_code,
      rates: payload.rates,
      updatedAt:
        typeof payload.time_last_update_utc === 'string'
          ? payload.time_last_update_utc
          : '',
    };
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(TIMEOUT_MESSAGE, { cause: error });
    }
    throw error instanceof Error ? error : new Error(UNAVAILABLE_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}
