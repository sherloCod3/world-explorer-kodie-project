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
      { name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 },
      { name: 'Argentina', alpha3Code: 'ARG', region: 'Americas', population: 44000000 },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchAllCountries();
    expect(result).toHaveLength(2);
    expect(result[0].name.common).toBe('Brasil');
    expect(result[0].cca3).toBe('BRA');
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
    const mockData = [{ name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await searchCountries('Brasil');
    expect(result).toHaveLength(1);
    expect(result[0].name.common).toBe('Brasil');
    expect(result[0].cca3).toBe('BRA');
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
    const mockData = [{ name: 'Brasil', alpha3Code: 'BRA', region: 'Americas', population: 210000000 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchCountryByCode('BRA');
    expect(result.name.common).toBe('Brasil');
    expect(result.cca3).toBe('BRA');
  });

  it('lançou erro quando país não encontrado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchCountryByCode('XXX')).rejects.toThrow('País não encontrado: XXX');
  });
});
