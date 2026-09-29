/**
 * Testes do componente CountryGrid.
 *
 * Cobertura:
 * - Renderização de lista de países
 * - Estado vazio com mensagem apropriada
 * - Estado vazio na view de favoritos
 * - Grid responsivo
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountryGrid } from '../../components/CountryGrid';
import type { Country } from '../../types/country';

const mockCountries: Country[] = [
  {
    name: { common: 'Brasil', official: 'República Federativa do Brasil' },
    cca3: 'BRA',
    region: 'Americas',
    population: 214326223,
    area: 8515767,
    flags: { png: 'br.png', svg: 'br.svg' },
    capital: ['Brasília'],
    languages: { por: 'Portuguese' },
    currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } },
    latlng: [-10, -55],
    landlocked: false,
    continents: ['South America'],
    timezones: ['UTC-03:00'],
    flag: '🇧🇷',
  },
  {
    name: { common: 'Japão', official: 'Japan' },
    cca3: 'JPN',
    region: 'Asia',
    population: 125681593,
    area: 377930,
    flags: { png: 'jp.png', svg: 'jp.svg' },
    capital: ['Tokyo'],
    languages: { jpn: 'Japanese' },
    currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } },
    latlng: [36, 138],
    landlocked: false,
    continents: ['Asia'],
    timezones: ['UTC+09:00'],
    flag: '🇯🇵',
  },
];

const defaultProps = {
  countries: mockCountries,
  isFavorite: vi.fn().mockReturnValue(false),
  onToggleFavorite: vi.fn(),
  onSelectCountry: vi.fn(),
  isFavoritesView: false,
};

describe('CountryGrid', () => {
  it('renderizou todos os países', () => {
    render(<CountryGrid {...defaultProps} />);
    expect(screen.getByText('Brasil')).toBeInTheDocument();
    expect(screen.getByText('Japão')).toBeInTheDocument();
  });

  it('exibiu mensagem quando nenhum resultado encontrado', () => {
    render(<CountryGrid {...defaultProps} countries={[]} />);
    expect(screen.getByText('Nenhum país encontrado')).toBeInTheDocument();
  });

  it('exibiu mensagem específica na view de favoritos vazia', () => {
    render(<CountryGrid {...defaultProps} countries={[]} isFavoritesView={true} />);
    expect(screen.getByText('Nenhum favorito ainda')).toBeInTheDocument();
  });

  it('exibiu dica na view de favoritos vazia', () => {
    render(<CountryGrid {...defaultProps} countries={[]} isFavoritesView={true} />);
    expect(
      screen.getByText('Clique no coração de um país para adicioná-lo aos favoritos.')
    ).toBeInTheDocument();
  });

  it('executou onSelect ao clicar em um card', () => {
    const onSelectCountry = vi.fn();
    render(<CountryGrid {...defaultProps} onSelectCountry={onSelectCountry} />);

    const card = screen.getByText('Brasil').closest('article');
    fireEvent.click(card!);

    expect(onSelectCountry).toHaveBeenCalledWith(mockCountries[0]);
  });
});
