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
  const [state, setState] = useState<RequestState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  /**
   * Busca inicial dos dados. Executada uma vez no mount.
   * Tratamento de erro: exibe mensagem amigável ao usuário.
   */
  const loadData = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchAllCountries();
      setCountries(data);
      setState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    refetch: loadData,
  };
}
