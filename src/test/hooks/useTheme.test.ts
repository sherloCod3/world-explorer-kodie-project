/**
 * Testes do hook useTheme.
 *
 * Cobertura:
 * - Tema inicial baseado na preferência do sistema
 * - Alternância entre claro e escuro
 * - Persistência no localStorage
 * - Aplicação da classe 'dark' no documento
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('inicializou com tema claro por padrão', () => {
    // Simula sistema sem preferência de dark mode
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('alternou tema de claro para escuro', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('aplicou classe dark no documento', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removeu classe dark ao voltar para claro', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme(); // light -> dark
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleTheme(); // dark -> light
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persistiu tema no localStorage', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('world-explorer-theme')).toBe('dark');
  });

  it('carregou tema salvo do localStorage', () => {
    localStorage.setItem('world-explorer-theme', 'dark');

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });
});
