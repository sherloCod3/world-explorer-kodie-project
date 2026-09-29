/**
 * Testes do módulo de API.
 *
 * Cobertura:
 * - fetchAllCountries: busca bem-sucedida e tratamento de erro
 * - searchCountries: busca por nome, 404 e erro
 * - fetchCountryByCode: busca por código e erro
 *
 * Utiliza mock do fetch para simular respostas da API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllCountries, searchCountries, fetchCountryByCode } from '../../utils/api';

// Mock global do fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('API - fetchAllCountries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou lista de países com sucesso', async () => {
    const mockData = [
      { name: { common: 'Brasil' }, cca3: 'BRA' },
      { name: { common: 'Argentina' }, cca3: 'ARG' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchAllCountries();
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('lançou erro quando resposta não foi OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchAllCountries()).rejects.toThrow('Erro ao buscar países: 500');
  });
});

describe('API - searchCountries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou resultados da busca', async () => {
    const mockData = [{ name: { common: 'Brasil' }, cca3: 'BRA' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await searchCountries('Brasil');
    expect(result).toEqual(mockData);
  });

  it('retornou array vazio quando país não encontrado (404)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await searchCountries('PaísInexistente');
    expect(result).toEqual([]);
  });

  it('lançou erro para outros status de erro', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    await expect(searchCountries('Test')).rejects.toThrow('Erro na busca: 503');
  });
});

describe('API - fetchCountryByCode', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retornou país pelo código', async () => {
    const mockData = { name: { common: 'Brasil' }, cca3: 'BRA' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchCountryByCode('BRA');
    expect(result).toEqual(mockData);
  });

  it('lançou erro quando país não encontrado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchCountryByCode('XXX')).rejects.toThrow('País não encontrado: XXX');
  });
});
