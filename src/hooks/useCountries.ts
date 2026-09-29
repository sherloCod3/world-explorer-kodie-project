/**
 * Hook customizado para gerenciar dados dos países.
 * Responsabilidades:
 * - Buscar dados da API no carregamento inicial
 * - Gerenciar estados de loading, erro e sucesso
 * - Aplicar filtros (busca por nome, região) e ordenação
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Country, RequestState } from '../types/country';
import { fetchAllCountries } from '../utils/api';

interface UseCountriesReturn {
  countries: Country[];
  filteredCountries: Country[];
  state: RequestState;
  error: string | null;
  searchQuery: string;
  selectedRegion: string;
  sortBy: string;
  setSearchQuery: (query: string) => void;
  setSelectedRegion: (region: string) => void;
  setSortBy: (sort: string) => void;
  refetch: () => void;
}

export function useCountries(): UseCountriesReturn {
  const [countries, setCountries] = useState<Country[]>([]);
  // O carregamento começa no mount: o estado inicial já é "loading",
  // evitando um render vazio antes do primeiro efeito.
  const [state, setState] = useState<RequestState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  /**
   * Aplica o resultado da busca bem-sucedida no estado da aplicação.
   */
  const applySuccess = useCallback((data: Country[]) => {
    setCountries(data);
    setError(null);
    setState('success');
  }, []);

  /**
   * Aplica a falha da busca no estado da aplicação, com mensagem amigável.
   */
  const applyFailure = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    setError(message);
    setState('error');
  }, []);

  /**
   * Carga inicial dos dados.
   * O estado é atualizado apenas dentro dos callbacks da promise, evitando
   * renders em cascata a partir do efeito. O retorno da função cancela as
   * atualizações caso o componente seja desmontado durante a requisição.
   */
  useEffect(() => {
    let active = true;

    fetchAllCountries().then(
      (data) => {
        if (active) applySuccess(data);
      },
      (err: unknown) => {
        if (active) applyFailure(err);
      },
    );

    return () => {
      active = false;
    };
  }, [applySuccess, applyFailure]);

  /**
   * Recarrega os dados exibindo o estado de carregamento.
   * Chamada pelo botão "Tentar novamente" (evento do usuário).
   */
  const refetch = useCallback(() => {
    setState('loading');
    setError(null);
    fetchAllCountries().then(applySuccess, applyFailure);
  }, [applySuccess, applyFailure]);

  /**
   * Aplica filtros e ordenação sobre os dados brutos.
   * Utiliza useMemo para evitar recálculos desnecessários.
   *
   * Critérios:
   * - Busca: comparação case-insensitive no nome comum
   * - Região: filtro exato ou "All" para sem filtro
   * - Ordenação: nome (A-Z/Z-A) ou população (maior/menor)
   */
  const filteredCountries = useMemo(() => {
    let result = [...countries];

    // Filtro por busca de nome
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((country) =>
        country.name.common.toLowerCase().includes(query)
      );
    }

    // Filtro por região
    if (selectedRegion !== 'All') {
      result = result.filter((country) => country.region === selectedRegion);
    }

    // Ordenação
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.common.localeCompare(b.name.common));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.common.localeCompare(a.name.common));
        break;
      case 'population-desc':
        result.sort((a, b) => b.population - a.population);
        break;
      case 'population-asc':
        result.sort((a, b) => a.population - b.population);
        break;
      case 'area-desc':
        result.sort((a, b) => b.area - a.area);
        break;
      case 'area-asc':
        result.sort((a, b) => a.area - b.area);
        break;
      default:
        break;
    }

    return result;
  }, [countries, searchQuery, selectedRegion, sortBy]);

  return {
    countries,
    filteredCountries,
    state,
    error,
    searchQuery,
    selectedRegion,
    sortBy,
    setSearchQuery,
    setSelectedRegion,
    setSortBy,
    refetch,
  };
}
