/**
 * Testes do componente CountryDetail (modal de detalhes).
 *
 * Cobertura:
 * - Exibição dos dados principais do país
 * - Exibição condicional de campos que a API pode não fornecer
 * - Tratamento de área não informada
 * - Seções ocultas quando não há idiomas ou moedas
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountryDetail } from '../../components/CountryDetail';
import type { Country } from '../../types/country';

const brazil: Country = {
  name: {
    common: 'Brasil',
    official: 'República Federativa do Brasil',
    nativeName: 'Brasil',
  },
  cca3: 'BRA',
  ccn3: '076',
  region: 'Americas',
  subregion: 'South America',
  population: 214326223,
  area: 8515767,
  flags: {
    png: 'https://flagcdn.com/w320/br.png',
    svg: 'https://flagcdn.com/br.svg',
  },
  capital: ['Brasília'],
  languages: { pt: 'Portuguese' },
  currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } },
  latlng: [-10, -55],
  borders: ['ARG'],
  independent: true,
  timezones: ['UTC-03:00'],
  flag: '🇧🇷',
};

const neighbor: Country = {
  ...brazil,
  cca3: 'ARG',
  name: { common: 'Argentina', official: 'República Argentina' },
};

/** Renderiza o modal com valores padrão e devolve as props usadas. */
function renderDetail(
  overrides: {
    country?: Country;
    isFavorite?: boolean;
    onToggleFavorite?: (code: string) => void;
    onClose?: () => void;
    onSelectNeighbor?: (code: string) => void;
    neighbors?: Country[];
  } = {},
) {
  const props = {
    country: brazil,
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    onClose: vi.fn(),
    onSelectNeighbor: vi.fn(),
    neighbors: [] as Country[],
    ...overrides,
  };

  render(<CountryDetail {...props} />);

  return props;
}

describe('CountryDetail', () => {
  it('exibiu os dados principais do país', () => {
    renderDetail();

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Detalhes de Brasil',
    );
    expect(screen.getByText('Brasil')).toBeInTheDocument();
    expect(screen.getByText('República Federativa do Brasil')).toBeInTheDocument();
    expect(screen.getByText('Brasília')).toBeInTheDocument();
    expect(screen.getByText('Americas — South America')).toBeInTheDocument();
    expect(screen.getByText('214.326.223 habitantes')).toBeInTheDocument();
    expect(screen.getByText('8.515.767 km²')).toBeInTheDocument();
    expect(screen.getByText('Portuguese')).toBeInTheDocument();
    expect(screen.getByText('Brazilian real (R$)')).toBeInTheDocument();
  });

  it('ocultou o nome repetido quando oficial é igual ao comum', () => {
    renderDetail({
      country: {
        ...brazil,
        name: { common: 'Brasil', official: 'Brasil' },
      },
    });

    // O nome comum aparece uma única vez no modal.
    expect(screen.getAllByText('Brasil')).toHaveLength(1);
  });

  it('exibiu o nome oficial quando é diferente do comum', () => {
    renderDetail();

    expect(screen.getByText('República Federativa do Brasil')).toBeInTheDocument();
  });

  it('não exibiu campos que a API não fornece', () => {
    renderDetail();

    // A API countries.dev não retorna continents, unMember e landlocked.
    expect(screen.queryByText('Continente')).not.toBeInTheDocument();
    expect(screen.queryByText('Membro da ONU')).not.toBeInTheDocument();
    expect(screen.queryByText(/Sem litoral/)).not.toBeInTheDocument();
    expect(screen.getByText('Independente: Sim')).toBeInTheDocument();
  });

  it('exibiu os campos quando a API informa os valores', () => {
    renderDetail({
      country: {
        ...brazil,
        continents: ['South America'],
        unMember: true,
        landlocked: true,
      },
    });

    expect(screen.getByText('Continente')).toBeInTheDocument();
    expect(screen.getByText('South America')).toBeInTheDocument();
    expect(screen.getByText('Membro da ONU')).toBeInTheDocument();
    expect(screen.getByText('Sem litoral: Sim')).toBeInTheDocument();
  });

  it('exibiu "Não informada" quando a área não foi informada', () => {
    renderDetail({ country: { ...brazil, area: 0 } });

    expect(screen.getByText('Não informada')).toBeInTheDocument();
    expect(screen.queryByText('0 km²')).not.toBeInTheDocument();
  });

  it('ocultou as seções de idiomas e moedas quando estão vazias', () => {
    renderDetail({ country: { ...brazil, languages: {}, currencies: {} } });

    expect(screen.queryByText('Idiomas')).not.toBeInTheDocument();
    expect(screen.queryByText('Moedas')).not.toBeInTheDocument();
  });

  it('não exibiu parênteses vazios em moeda sem símbolo', () => {
    renderDetail({
      country: {
        ...brazil,
        currencies: { ZAR: { name: 'South African rand', symbol: '' } },
      },
    });

    expect(screen.getByText('South African rand')).toBeInTheDocument();
    expect(screen.queryByText(/\(\)/)).not.toBeInTheDocument();
  });

  it('exibiu "Não informada" quando a capital não foi informada', () => {
    renderDetail({ country: { ...brazil, capital: undefined } });

    expect(screen.getByText('Não informada')).toBeInTheDocument();
  });
});

describe('CountryDetail - interações', () => {
  it('fechou o modal ao pressionar ESC', () => {
    const props = renderDetail();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('fechou o modal ao clicar no botão de fechar', () => {
    const props = renderDetail();

    fireEvent.click(screen.getByLabelText('Fechar detalhes'));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('fechou o modal ao clicar fora do conteúdo', () => {
    const props = renderDetail();

    const overlay = screen.getByRole('dialog').firstElementChild;
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as HTMLElement);

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('posicionou o foco no botão de fechar ao abrir', () => {
    renderDetail();

    expect(screen.getByLabelText('Fechar detalhes')).toHaveFocus();
  });

  it('bloqueou o scroll do body e restaurou ao desmontar', () => {
    const { unmount } = render(
      <CountryDetail
        country={brazil}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClose={vi.fn()}
        onSelectNeighbor={vi.fn()}
        neighbors={[]}
      />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('favoritou o país pelo código CCA3', () => {
    const props = renderDetail();

    fireEvent.click(screen.getByLabelText('Adicionar aos favoritos'));

    expect(props.onToggleFavorite).toHaveBeenCalledWith('BRA');
  });

  it('exibiu a ação de remover quando o país já é favorito', () => {
    renderDetail({ isFavorite: true });

    expect(screen.getByLabelText('Remover dos favoritos')).toBeInTheDocument();
  });

  it('exibiu os países vizinhos e navegou entre eles', () => {
    const props = renderDetail({ neighbors: [neighbor] });

    expect(screen.getByText('Argentina')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Argentina'));

    expect(props.onSelectNeighbor).toHaveBeenCalledWith('ARG');
  });

  it('ocultou a seção de vizinhos quando não há fronteiras', () => {
    renderDetail({ country: { ...brazil, borders: [] }, neighbors: [] });

    expect(screen.queryByText('Países Vizinhos')).not.toBeInTheDocument();
  });
});
