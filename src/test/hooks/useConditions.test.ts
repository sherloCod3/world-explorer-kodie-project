/**
 * Testes do hook useConditions.
 *
 * Cobertura:
 * - Estado inicial de carregamento
 * - Sucesso com as condições do país
 * - Falha da API
 *
 * A camada de clima é simulada para testar apenas o hook.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConditions } from '../../hooks/useConditions';
import { fetchCountryConditions } from '../../utils/conditions';
import type { Country } from '../../types/country';

vi.mock('../../utils/conditions', () => ({
  fetchCountryConditions: vi.fn(),
  describeWeather: vi.fn(),
}));

const mockFetchCountryConditions = vi.mocked(fetchCountryConditions);

const brazil: Country = {
  name: { common: 'Brasil', official: 'Brasil' },
  cca3: 'BRA',
  region: 'Americas',
  population: 1,
  area: 1,
  flags: { png: '', svg: '' },
  languages: {},
  currencies: {},
  latlng: [-10, -55],
  timezones: [],
  flag: '',
};

const conditionsPayload = {
  place: 'Brasília',
  isCapital: true,
  timezone: 'America/Sao_Paulo',
  temperatureC: 27.4,
  weatherCode: 2,
};

describe('useConditions', () => {
  beforeEach(() => {
    mockFetchCountryConditions.mockReset();
  });

  it('iniciou no estado de carregamento', () => {
    // Requisição pendente: mantém o loading sem atualizar depois do teste.
    mockFetchCountryConditions.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useConditions(brazil));

    expect(result.current.state).toBe('loading');
    expect(result.current.conditions).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('retornou as condições recebidas', async () => {
    mockFetchCountryConditions.mockResolvedValue(conditionsPayload);

    const { result } = renderHook(() => useConditions(brazil));

    await waitFor(() => expect(result.current.state).toBe('success'));
    expect(result.current.conditions).toEqual(conditionsPayload);
    expect(result.current.error).toBeNull();
  });

  it('exibiu a mensagem de erro quando a API falhou', async () => {
    mockFetchCountryConditions.mockRejectedValue(
      new Error('Clima indisponível no momento.'),
    );

    const { result } = renderHook(() => useConditions(brazil));

    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBe('Clima indisponível no momento.');
    expect(result.current.conditions).toBeNull();
  });
});
