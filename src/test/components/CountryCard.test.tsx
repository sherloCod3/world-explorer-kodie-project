/**
 * Testes do componente CountryCard.
 *
 * Cobertura:
 * - Exibição de nome, capital, região e população
 * - Bandeira renderizada corretamente
 * - Botão de favorito funcional
 * - Clique no card abre detalhes
 * - Estado visual de favorito
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountryCard } from '../../components/CountryCard';
import type { Country } from '../../types/country';

const mockCountry: Country = {
  name: { common: 'Brasil', official: 'República Federativa do Brasil' },
  cca3: 'BRA',
  region: 'Americas',
  subregion: 'South America',
  population: 214326223,
  area: 8515767,
  flags: { png: 'https://flagcdn.com/png/br.png', svg: 'https://flagcdn.com/svg/br.svg' },
  capital: ['Brasília'],
  languages: { por: 'Portuguese' },
  currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } },
  latlng: [-10, -55],
  landlocked: false,
  continents: ['South America'],
  timezones: ['UTC-05:00', 'UTC-03:00'],
  flag: '🇧🇷',
};

const defaultProps = {
  country: mockCountry,
  isFavorite: false,
  onToggleFavorite: vi.fn(),
  onSelect: vi.fn(),
};

describe('CountryCard', () => {
  it('exibiu nome do país', () => {
    render(<CountryCard {...defaultProps} />);
    expect(screen.getByText('Brasil')).toBeInTheDocument();
  });

  it('exibiu capital do país', () => {
    render(<CountryCard {...defaultProps} />);
    expect(screen.getByText('Brasília')).toBeInTheDocument();
  });

  it('exibiu região do país', () => {
    render(<CountryCard {...defaultProps} />);
    expect(screen.getByText('Americas')).toBeInTheDocument();
  });

  it('exibiu população formatada', () => {
    render(<CountryCard {...defaultProps} />);
    expect(screen.getByText('214.326.223 hab.')).toBeInTheDocument();
  });

  it('renderizou a bandeira com alt text correto', () => {
    render(<CountryCard {...defaultProps} />);
    const flag = screen.getByAltText('Bandeira de Brasil');
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveAttribute('src', 'https://flagcdn.com/svg/br.svg');
  });

  it('executou onSelect ao clicar no card', () => {
    const onSelect = vi.fn();
    render(<CountryCard {...defaultProps} onSelect={onSelect} />);

    const card = screen.getByText('Brasil').closest('article');
    fireEvent.click(card!);

    expect(onSelect).toHaveBeenCalledWith(mockCountry);
  });

  it('executou onToggleFavorite ao clicar no botão de favorito', () => {
    const onToggleFavorite = vi.fn();
    render(<CountryCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

    const favButton = screen.getByLabelText('Adicionar Brasil aos favoritos');
    fireEvent.click(favButton);

    expect(onToggleFavorite).toHaveBeenCalledWith('BRA');
  });

  it('exibiu coração preenchido quando é favorito', () => {
    render(<CountryCard {...defaultProps} isFavorite={true} />);
    const button = screen.getByLabelText('Remover Brasil dos favoritos');
    expect(button).toBeInTheDocument();
  });

  it('exibiu coração vazio quando não é favorito', () => {
    render(<CountryCard {...defaultProps} isFavorite={false} />);
    const button = screen.getByLabelText('Adicionar Brasil aos favoritos');
    expect(button).toBeInTheDocument();
  });
});
