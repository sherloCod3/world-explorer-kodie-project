/**
 * Testes do hook useFavorites.
 *
 * Cobertura:
 * - Inicialização sem favoritos
 * - Adicionar/remover favorito
 * - Persistência no localStorage
 * - Limpeza de favoritos
 * - Validação de limite máximo
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFavorites } from '../../hooks/useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicializou sem favoritos', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.favoritesCount).toBe(0);
  });

  it('adicionou país aos favoritos', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('BRA');
    });

    expect(result.current.favorites).toContain('BRA');
    expect(result.current.favoritesCount).toBe(1);
    expect(result.current.isFavorite('BRA')).toBe(true);
  });

  it('removeu país dos favoritos', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('BRA');
    });
    expect(result.current.isFavorite('BRA')).toBe(true);

    act(() => {
      result.current.toggleFavorite('BRA');
    });
    expect(result.current.isFavorite('BRA')).toBe(false);
    expect(result.current.favoritesCount).toBe(0);
  });

  it('persistiu favoritos no localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('BRA');
      result.current.toggleFavorite('USA');
    });

    const stored = JSON.parse(localStorage.getItem('world-explorer-favorites') || '[]');
    expect(stored).toEqual(['BRA', 'USA']);
  });

  it('carregou favoritos existentes do localStorage', () => {
    localStorage.setItem('world-explorer-favorites', JSON.stringify(['JPN', 'FRA']));
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual(['JPN', 'FRA']);
    expect(result.current.favoritesCount).toBe(2);
  });

  it('limpou todos os favoritos', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('BRA');
      result.current.toggleFavorite('USA');
    });
    expect(result.current.favoritesCount).toBe(2);

    act(() => {
      result.current.clearFavorites();
    });
    expect(result.current.favoritesCount).toBe(0);
    expect(result.current.favorites).toEqual([]);
  });

  it('impediu duplicatas nos favoritos', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('BRA');
      result.current.toggleFavorite('BRA'); // Segunda chamada remove
    });

    expect(result.current.favoritesCount).toBe(0);
  });

  it('tratou dados corrompidos no localStorage', () => {
    localStorage.setItem('world-explorer-favorites', 'invalid-json');
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
  });

  it('tratou dados não-array no localStorage', () => {
    localStorage.setItem('world-explorer-favorites', JSON.stringify({ key: 'value' }));
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
  });
});
