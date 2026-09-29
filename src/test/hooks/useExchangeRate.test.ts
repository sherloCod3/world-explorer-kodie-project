/**
 * Testes do hook useExchangeRate.
 *
 * Cobertura:
 * - Estado inicial de carregamento
 * - Sucesso com cotação para a moeda
 * - Sucesso sem cotação (moeda ausente nos rates)
 * - Falha da API
 *
 * A camada de câmbio é simulada para testar apenas o hook.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { fetchExchangeRates } from '../../utils/exchange';

vi.mock('../../utils/exchange', () => ({
  fetchExchangeRates: vi.fn(),
}));

const mockFetchExchangeRates = vi.mocked(fetchExchangeRates);

const ratesPayload = {
  base: 'BRL',
  rates: { BRL: 1, EUR: 0.168828 },
  updatedAt: 'Tue, 29 Sep 2026 00:02:31 +0000',
};

describe('useExchangeRate', () => {
  beforeEach(() => {
    mockFetchExchangeRates.mockReset();
  });

  it('iniciou no estado de carregamento', () => {
    // Requisição pendente: mantém o loading sem atualizar depois do teste.
    mockFetchExchangeRates.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useExchangeRate('EUR'));

    expect(result.current.state).toBe('loading');
    expect(result.current.quote).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('retornou a cotação da moeda pedida', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    const { result } = renderHook(() => useExchangeRate('EUR'));

    await waitFor(() => expect(result.current.state).toBe('success'));
    expect(result.current.quote).toEqual({
      code: 'EUR',
      rate: 0.168828,
      updatedAt: 'Tue, 29 Sep 2026 00:02:31 +0000',
    });
    expect(result.current.error).toBeNull();
  });

  it('concluiu sem cotação quando a moeda não existe nos rates', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    const { result } = renderHook(() => useExchangeRate('XYZ'));

    await waitFor(() => expect(result.current.state).toBe('success'));
    expect(result.current.quote).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('exibiu a mensagem de erro quando a API falhou', async () => {
    mockFetchExchangeRates.mockRejectedValue(
      new Error('Cotação indisponível no momento.'),
    );

    const { result } = renderHook(() => useExchangeRate('EUR'));

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('Cotação indisponível no momento.');
    expect(result.current.quote).toBeNull();
  });
});
