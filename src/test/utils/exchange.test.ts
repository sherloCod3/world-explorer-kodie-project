/**
 * Testes do utilitário de câmbio (exchange.ts).
 *
 * Cobertura:
 * - Resposta de sucesso (base, taxas e data de atualização)
 * - Falhas: status HTTP, corpo que não é JSON, payload com formato inválido
 * - Tempo limite (AbortController)
 *
 * O fetch é simulado globalmente, como em api.test.ts.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchExchangeRates } from '../../utils/exchange';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

/** Resposta de sucesso realista da API. */
const successPayload = {
  result: 'success',
  base_code: 'BRL',
  rates: { BRL: 1, EUR: 0.168828, USD: 0.18 },
  time_last_update_utc: 'Tue, 29 Sep 2026 00:02:31 +0000',
};

describe('exchange - fetchExchangeRates', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou base, taxas e data de atualização', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    });

    const rates = await fetchExchangeRates();

    expect(rates.base).toBe('BRL');
    expect(rates.rates.EUR).toBe(0.168828);
    expect(rates.updatedAt).toBe('Tue, 29 Sep 2026 00:02:31 +0000');
  });

  it('lançou erro quando a API responde fora de sucesso', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: 'error' }),
    });

    await expect(fetchExchangeRates()).rejects.toThrow(
      'Cotação indisponível no momento.',
    );
  });

  it('lançou erro quando a resposta não foi OK', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(fetchExchangeRates()).rejects.toThrow(
      'Cotação indisponível no momento.',
    );
  });

  it('lançou erro quando a resposta não é JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('html inesperado')),
    });

    await expect(fetchExchangeRates()).rejects.toThrow(
      'Cotação indisponível no momento.',
    );
  });

  it('lançou erro quando as taxas não são numéricas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...successPayload, rates: { EUR: 'x' } }),
    });

    await expect(fetchExchangeRates()).rejects.toThrow(
      'Cotação indisponível no momento.',
    );
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

      const promise = fetchExchangeRates();
      // Handler anexado antes de avançar o tempo para não gerar rejeição solta.
      const assertion = expect(promise).rejects.toThrow(
        'Tempo limite ao buscar a cotação.',
      );

      await vi.advanceTimersByTimeAsync(15001);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
