/**
 * Testes de integração do componente App.
 *
 * Cobertura:
 * - Carga inicial e exibição dos países
 * - Busca combinada com o grid de resultados
 * - Visão de favoritos
 * - Abertura, navegação entre vizinhos e fechamento do modal
 * - Estado de erro com ação de tentar novamente
 * - Alternância de tema
 *
 * A camada de API é simulada; os componentes e hooks são reais.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { fetchAllCountries } from '../utils/api';
import type { Country } from '../types/country';

vi.mock('../utils/api', () => ({
  fetchAllCountries: vi.fn(),
}));

// Os serviços auxiliares são simulados: nenhum teste chama a rede real.
vi.mock('../utils/conditions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/conditions')>();
  return {
    ...actual,
    // Requisição pendente: o cartão fica em carregamento sem tocar na rede.
    fetchCountryConditions: vi.fn(() => new Promise(() => {})),
  };
});

vi.mock('../utils/exchange', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/exchange')>();
  return {
    ...actual,
    fetchExchangeRates: vi.fn(() => new Promise(() => {})),
  };
});

const mockFetchAllCountries = vi.mocked(fetchAllCountries);

/** Monta um país com os campos obrigatórios do tipo Country. */
function buildCountry(
  code: string,
  common: string,
  overrides: Partial<Country> = {},
): Country {
  return {
    name: { common, official: `${common} (oficial)` },
    cca3: code,
    region: 'Americas',
    population: 1000,
    area: 1000,
    flags: { png: `png-${code}`, svg: `svg-${code}` },
    languages: {},
    currencies: {},
    latlng: [],
    timezones: [],
    flag: '',
    ...overrides,
  };
}

const brazil = buildCountry('BRA', 'Brasil', { borders: ['ARG'] });
const argentina = buildCountry('ARG', 'Argentina');
const japan = buildCountry('JPN', 'Japão', { region: 'Asia' });

const countries = [brazil, argentina, japan];

describe('App', () => {
  beforeEach(() => {
    mockFetchAllCountries.mockReset();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('carregou e exibiu os países', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    render(<App />);

    expect(await screen.findByText('Brasil')).toBeInTheDocument();
    expect(screen.getByText('Japão')).toBeInTheDocument();
    expect(screen.getByText('Explore o Mundo')).toBeInTheDocument();
  });

  it('exibiu mensagem amigável quando nenhum país foi encontrado', async () => {
    mockFetchAllCountries.mockResolvedValue([]);

    render(<App />);

    expect(await screen.findByText('Nenhum país encontrado')).toBeInTheDocument();
  });

  it('filtrou os países pela busca', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    render(<App />);
    await screen.findByText('Brasil');

    fireEvent.change(screen.getByPlaceholderText('Buscar país...'), {
      target: { value: 'jap' },
    });

    expect(await screen.findByText('Japão')).toBeInTheDocument();
    expect(screen.queryByText('Brasil')).not.toBeInTheDocument();
  });

  it('exibiu apenas os favoritos na visão de favoritos', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    render(<App />);
    await screen.findByText('Brasil');

    fireEvent.click(screen.getByLabelText('Adicionar Brasil aos favoritos'));
    fireEvent.click(screen.getByLabelText('Ver favoritos'));

    expect(screen.getByText('Meus Favoritos')).toBeInTheDocument();
    expect(screen.getByText('Brasil')).toBeInTheDocument();
    expect(screen.queryByText('Japão')).not.toBeInTheDocument();
  });

  it('abriu o modal, navegou para o vizinho e fechou com ESC', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    render(<App />);
    fireEvent.click(await screen.findByText('Brasil'));

    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Detalhes de Brasil',
    );
    // A seção auxiliar é exibida com os cartões de clima e câmbio.
    expect(screen.getByText('Para viajar')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Argentina' }));

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Detalhes de Argentina',
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('exibiu o erro e recarregou ao tentar novamente', async () => {
    mockFetchAllCountries.mockRejectedValueOnce(
      new Error('Erro ao buscar países: 500'),
    );

    render(<App />);

    expect(await screen.findByText('Ops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Erro ao buscar países: 500')).toBeInTheDocument();

    mockFetchAllCountries.mockResolvedValueOnce(countries);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Brasil')).toBeInTheDocument();
    expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument();
  });

  it('alternou o tema aplicando a classe dark no documento', async () => {
    mockFetchAllCountries.mockResolvedValue(countries);

    render(<App />);
    await screen.findByText('Brasil');

    fireEvent.click(screen.getByLabelText('Ativar modo escuro'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByLabelText('Ativar modo claro')).toBeInTheDocument();
  });
});
