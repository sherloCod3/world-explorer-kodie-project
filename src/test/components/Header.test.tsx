/**
 * Testes do componente Header.
 *
 * Cobertura:
 * - Renderização do título e ícone
 * - Barra de busca funcional
 * - Botão de favoritos com contador
 * - Botão de toggle de tema
 * - Acessibilidade (aria-labels)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../../components/Header';

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  favoritesCount: 0,
  showFavorites: false,
  onToggleFavorites: vi.fn(),
  theme: 'light' as const,
  onToggleTheme: vi.fn(),
};

describe('Header', () => {
  it('renderizou o título da aplicação', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('World Explorer')).toBeInTheDocument();
  });

  it('renderizou a barra de busca com placeholder correto', () => {
    render(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Buscar país...');
    expect(input).toBeInTheDocument();
  });

  it('executou callback ao digitar na busca', () => {
    const onSearchChange = vi.fn();
    render(<Header {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText('Buscar país...');
    fireEvent.change(input, { target: { value: 'Brasil' } });

    expect(onSearchChange).toHaveBeenCalledWith('Brasil');
  });

  it('exibiu contador de favoritos quando há favoritos', () => {
    render(<Header {...defaultProps} favoritesCount={5} />);
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });

  it('exibiu texto "Favoritos" quando não há favoritos', () => {
    render(<Header {...defaultProps} favoritesCount={0} />);
    expect(screen.getByText('Favoritos')).toBeInTheDocument();
  });

  it('executou callback ao clicar no botão de favoritos', () => {
    const onToggleFavorites = vi.fn();
    render(<Header {...defaultProps} onToggleFavorites={onToggleFavorites} />);

    const button = screen.getByLabelText('Ver favoritos');
    fireEvent.click(button);

    expect(onToggleFavorites).toHaveBeenCalled();
  });

  it('aplicou estilo ativo quando favoritos estão visíveis', () => {
    render(<Header {...defaultProps} showFavorites={true} />);
    const button = screen.getByLabelText('Ver todos os países');
    expect(button).toBeInTheDocument();
  });

  it('executou callback ao clicar no toggle de tema', () => {
    const onToggleTheme = vi.fn();
    render(<Header {...defaultProps} onToggleTheme={onToggleTheme} />);

    const button = screen.getByLabelText('Ativar modo escuro');
    fireEvent.click(button);

    expect(onToggleTheme).toHaveBeenCalled();
  });

  it('exibiu ícone de sol quando tema é escuro', () => {
    render(<Header {...defaultProps} theme="dark" />);
    expect(screen.getByLabelText('Ativar modo claro')).toBeInTheDocument();
  });
});
