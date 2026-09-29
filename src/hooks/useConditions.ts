/**
 * Hook de condições do país (localização, fuso e clima) para o modal.
 * Responsabilidades:
 * - Buscar geocoding da capital e previsão ao montar o cartão
 * - Gerenciar estados de loading, erro e sucesso
 * - Cancelar a busca quando o cartão é desmontado
 */
import { useCallback, useEffect, useState } from 'react';
import type { Country, RequestState } from '../types/country';
import type { Conditions } from '../types/travel';
import { fetchCountryConditions } from '../utils/conditions';

interface UseConditionsReturn {
  state: RequestState;
  error: string | null;
  conditions: Conditions | null;
}

export function useConditions(country: Country): UseConditionsReturn {
  const [state, setState] = useState<RequestState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [conditions, setConditions] = useState<Conditions | null>(null);

  /** Aplica as condições recebidas no estado da aplicação. */
  const applySuccess = useCallback((result: Conditions) => {
    setConditions(result);
    setError(null);
    setState('success');
  }, []);

  /** Aplica a falha da busca no estado da aplicação, com mensagem amigável. */
  const applyFailure = useCallback((err: unknown) => {
    setConditions(null);
    setError(err instanceof Error ? err.message : 'Erro desconhecido');
    setState('error');
  }, []);

  useEffect(() => {
    let active = true;

    fetchCountryConditions(country).then(
      (result) => {
        if (active) applySuccess(result);
      },
      (err: unknown) => {
        if (active) applyFailure(err);
      },
    );

    return () => {
      active = false;
    };
  }, [country, applySuccess, applyFailure]);

  return { state, error, conditions };
}
