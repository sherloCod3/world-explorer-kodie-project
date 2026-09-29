/**
 * Testes do componente FilterBar.
 *
 * Cobertura:
 * - Renderização dos selects de região e ordenação
 * - Callbacks ao alterar filtros
 * - Exibição do contador de resultados
 * - Acessibilidade
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '../../components/FilterBar';

const defaultProps = {
  selectedRegion: 'All',
  onRegionChange: vi.fn(),
  sortBy: 'name-asc',
  onSortChange: vi.fn(),
  totalResults: 250,
};

describe('FilterBar', () => {
  it('renderizou seletor de região com opção "Todas"', () => {
    render(<FilterBar {...defaultProps} />);
    const select = screen.getByLabelText('Filtrar por região');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Todas as regiões')).toBeInTheDocument();
  });

  it('renderizou seletor de ordenação', () => {
    render(<FilterBar {...defaultProps} />);
    const select = screen.getByLabelText('Ordenar resultados');
    expect(select).toBeInTheDocument();
  });

  it('exibiu contador de resultados', () => {
    render(<FilterBar {...defaultProps} totalResults={42} />);
    expect(screen.getByText('42 países encontrados')).toBeInTheDocument();
  });

  it('exibiu singular quando apenas 1 resultado', () => {
    render(<FilterBar {...defaultProps} totalResults={1} />);
    expect(screen.getByText('1 país encontrado')).toBeInTheDocument();
  });

  it('executou callback ao alterar região', () => {
    const onRegionChange = vi.fn();
    render(<FilterBar {...defaultProps} onRegionChange={onRegionChange} />);

    const select = screen.getByLabelText('Filtrar por região');
    fireEvent.change(select, { target: { value: 'Europe' } });

    expect(onRegionChange).toHaveBeenCalledWith('Europe');
  });

  it('executou callback ao alterar ordenação', () => {
    const onSortChange = vi.fn();
    render(<FilterBar {...defaultProps} onSortChange={onSortChange} />);

    const select = screen.getByLabelText('Ordenar resultados');
    fireEvent.change(select, { target: { value: 'population-desc' } });

    expect(onSortChange).toHaveBeenCalledWith('population-desc');
  });

  it('exibiu todas as regiões disponíveis', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText('Africa')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
    expect(screen.getByText('Asia')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('Oceania')).toBeInTheDocument();
  });
});
