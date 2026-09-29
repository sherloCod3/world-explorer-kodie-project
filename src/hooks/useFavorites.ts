/**
 * Hook customizado para gerenciar países favoritos.
 * Persistência via localStorage para manter dados entre sessões.
 *
 * Estrutura: array de códigos CCA3 dos países favoritados.
 * Validação: impede duplicatas e limita a 50 favoritos.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'world-explorer-favorites';
const MAX_FAVORITES = 50;

interface UseFavoritesReturn {
  favorites: string[];
  isFavorite: (code: string) => boolean;
  toggleFavorite: (code: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

/**
 * Lê favoritos do localStorage com tratamento de erro.
 * Retorna array vazio se dados corrompidos ou ausentes.
 */
function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  /**
   * Sincroniza estado com localStorage a cada alteração.
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // localStorage cheio ou indisponível — falha silenciosa
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (code: string) => favorites.includes(code),
    [favorites]
  );

  /**
   * Adiciona ou remove um país dos favoritos.
   * Validação: não permite exceder limite máximo.
   */
  const toggleFavorite = useCallback(
    (code: string) => {
      setFavorites((prev) => {
        if (prev.includes(code)) {
          return prev.filter((c) => c !== code);
        }
        if (prev.length >= MAX_FAVORITES) {
          return prev;
        }
        return [...prev, code];
      });
    },
    []
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}
