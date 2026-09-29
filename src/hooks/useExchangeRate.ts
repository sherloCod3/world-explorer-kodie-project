/**
 * Hook de cotação de câmbio (base BRL) para o modal de detalhes.
 * Responsabilidades:
 * - Buscar a cotação ao montar o cartão
 * - Gerenciar estados de loading, erro e sucesso
 * - Concluir sem cotação quando a moeda do país não existe nos rates
 *   (a interface oculta o cartão nesses casos)
 */
import { useCallback, useEffect, useState } from 'react';
import type { RequestState } from '../types/country';
import { fetchExchangeRates } from '../utils/exchange';

/** Cotação pronta para exibição de um país. */
export interface Quote {
  /** Código da moeda do país (ex.: "EUR"). */
  code: string;
  /** Quantas unidades da moeda valem 1 real. */
  rate: number;
  /** Data e hora da última atualização informada pela API. */
  updatedAt: string;
}

interface UseExchangeRateReturn {
  state: RequestState;
  error: string | null;
  quote: Quote | null;
}

export function useExchangeRate(code: string): UseExchangeRateReturn {
  const [state, setState] = useState<RequestState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  /** Aplica a cotação recebida no estado da aplicação. */
  const applySuccess = useCallback((result: Quote | null) => {
    setQuote(result);
    setError(null);
    setState('success');
  }, []);

  /** Aplica a falha da busca no estado da aplicação, com mensagem amigável. */
  const applyFailure = useCallback((err: unknown) => {
    setQuote(null);
    setError(err instanceof Error ? err.message : 'Erro desconhecido');
    setState('error');
  }, []);

  useEffect(() => {
    let active = true;

    fetchExchangeRates().then(
      (rates) => {
        if (!active) return;
        const rate = rates.rates[code];
        applySuccess(
          typeof rate === 'number'
            ? { code, rate, updatedAt: rates.updatedAt }
            : null,
        );
      },
      (err: unknown) => {
        if (active) applyFailure(err);
      },
    );

    return () => {
      active = false;
    };
  }, [code, applySuccess, applyFailure]);

  return { state, error, quote };
}
