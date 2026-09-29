/**
 * Testes do hook useCountries.
 *
 * Cobertura:
 * - Carga inicial dos dados (estados loading, success e error)
 * - Busca por nome (sem diferenciar maiúsculas)
 * - Filtro por região
 * - Ordenação por nome, população e área
 * - Recarga dos dados (refetch)
 *
 * A camada de API é simulada para testar apenas o comportamento do hook.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCountries } from '../../hooks/useCountries';
import { fetchAllCountries } from '../../utils/api';
import type { Country } from '../../types/country';

vi.mock('../../utils/api', () => ({
  fetchAllCountries: vi.fn(),
}));

const mockFetchAllCountries = vi.mocked(fetchAllCountries);

/** Monta um país com os campos obrigatórios do tipo Country. */
function buildCountry(
  code: string,
  common: string,
  overrides: Partial<Country> = {},
): Country {
  return {
    name: { common, official: `${common} (oficial)` },
    cca3: code,
    region: 'Americas',
    population: 1000,
    area: 1000,
    flags: { png: `png-${code}`, svg: `svg-${code}` },
    languages: {},
    currencies: {},
    latlng: [],
    timezones: [],
    flag: '',
    ...overrides,
  };
}

const brazil = buildCountry('BRA', 'Brasil', {
  population: 214326223,
  area: 8515767,
});
const japan = buildCountry('JPN', 'Japão', {
  region: 'Asia',
  population: 125700000,
  area: 377975,
});
const bolivia = buildCountry('BOL', 'Bolívia', {
  population: 11673021,
  area: 1098581,
});

const countries = [brazil, japan, bolivia];

describe('useCountries', () => {
  beforeEach(() => {
    mockFetchAllCountries.mockReset();
  });

  it('iniciou no estado de carregamento', () => {
    // Requisição pendente: mantém o estado de carregamento sem atualizar depois.
    mockFetchAllCountries.mockReturnValue(new Promise<Country[]>(() => {}));

    const { result } = renderHook(() => useCountries());

    expect(result.current.state).toBe('loading');
    expect(result.current.countries).toEqual([]);
  });

  it('carregou os países com sucesso', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());

    await waitFor(() => expect(result.current.state).toBe('success'));
    expect(result.current.countries).toHaveLength(3);
    expect(result.current.filteredCountries).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('exibiu a mensagem de erro da API quando a busca falhou', async () => {
    mockFetchAllCountries.mockRejectedValue(new Error('Erro ao buscar países: 500'));

    const { result } = renderHook(() => useCountries());

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('Erro ao buscar países: 500');
    expect(result.current.countries).toEqual([]);
  });

  it('usou mensagem padrão quando o erro não é uma exceção', async () => {
    mockFetchAllCountries.mockRejectedValue('falha inesperada');

    const { result } = renderHook(() => useCountries());

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('Erro desconhecido');
  });

  it('filtrou pelo nome sem diferenciar maiúsculas', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    act(() => {
      result.current.setSearchQuery('jap');
    });

    expect(result.current.filteredCountries).toHaveLength(1);
    expect(result.current.filteredCountries[0].cca3).toBe('JPN');

    act(() => {
      result.current.setSearchQuery('  JAP  ');
    });

    expect(result.current.filteredCountries).toHaveLength(1);
  });

  it('filtrou pela região selecionada', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    act(() => {
      result.current.setSelectedRegion('Americas');
    });

    expect(result.current.filteredCountries.map((c) => c.cca3)).toEqual(['BOL', 'BRA']);

    act(() => {
      result.current.setSelectedRegion('All');
    });

    expect(result.current.filteredCountries).toHaveLength(3);
  });

  it('ordenou por população decrescente', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    act(() => {
      result.current.setSortBy('population-desc');
    });

    expect(result.current.filteredCountries.map((c) => c.cca3)).toEqual([
      'BRA',
      'JPN',
      'BOL',
    ]);
  });

  it('ordenou por área crescente', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    act(() => {
      result.current.setSortBy('area-asc');
    });

    expect(result.current.filteredCountries.map((c) => c.cca3)).toEqual([
      'JPN',
      'BOL',
      'BRA',
    ]);
  });

  it('manteve a lista original intacta após a ordenação', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    act(() => {
      result.current.setSortBy('name-desc');
    });

    expect(result.current.countries.map((c) => c.cca3)).toEqual(['BRA', 'JPN', 'BOL']);
  });

  it('recarregou os dados exibindo o estado de carregamento', async () => {
    mockFetchAllCountries.mockResolvedValueOnce(countries);

    const { result } = renderHook(() => useCountries());
    await waitFor(() => expect(result.current.state).toBe('success'));

    mockFetchAllCountries.mockRejectedValueOnce(new Error('Erro ao buscar países: 500'));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.state).toBe('loading');

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('Erro ao buscar países: 500');
  });
});
