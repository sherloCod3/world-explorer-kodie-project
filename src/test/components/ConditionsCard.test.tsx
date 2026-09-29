/**
 * Testes do componente ConditionsCard (clima e horário local).
 *
 * Cobertura:
 * - Estado de carregamento
 * - Sucesso: local, temperatura, condição, relógio, umidade, vento e sol
 * - Código de tempo desconhecido (sem descrição inventada)
 * - Fallback "Centro do país"
 * - Estado de erro com atribuição da fonte
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConditionsCard } from '../../components/ConditionsCard';
import { fetchCountryConditions } from '../../utils/conditions';
import type { Country } from '../../types/country';

vi.mock('../../utils/conditions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/conditions')>();
  return { ...actual, fetchCountryConditions: vi.fn() };
});

const mockFetchCountryConditions = vi.mocked(fetchCountryConditions);

const brazil: Country = {
  name: { common: 'Brasil', official: 'Brasil' },
  cca3: 'BRA',
  region: 'Americas',
  population: 1,
  area: 1,
  flags: { png: '', svg: '' },
  capital: ['Brasília'],
  languages: {},
  currencies: {},
  latlng: [-10, -55],
  timezones: [],
  flag: '',
};

const conditions = {
  place: 'Brasília',
  isCapital: true,
  timezone: 'America/Sao_Paulo',
  temperatureC: 27.4,
  weatherCode: 2,
  humidity: 60,
  windKmh: 12.3,
  sunrise: '2026-09-29T06:12',
  sunset: '2026-09-29T18:30',
};

describe('ConditionsCard', () => {
  beforeEach(() => {
    mockFetchCountryConditions.mockReset();
  });

  it('exibiu o carregamento enquanto busca', () => {
    mockFetchCountryConditions.mockReturnValue(new Promise(() => {}));

    render(<ConditionsCard country={brazil} />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando clima…');
  });

  it('exibiu local, clima, horário e fonte nos dados completos', async () => {
    mockFetchCountryConditions.mockResolvedValue(conditions);

    render(<ConditionsCard country={brazil} />);

    expect(await screen.findByText('Brasília')).toBeInTheDocument();
    expect(screen.getByText('27,4°C')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('Umidade 60%')).toBeInTheDocument();
    expect(screen.getByText('Vento 12,3 km/h')).toBeInTheDocument();
    expect(screen.getByText('Nascer 06:12')).toBeInTheDocument();
    expect(screen.getByText('Pôr 18:30')).toBeInTheDocument();

    const source = screen.getByRole('link', { name: 'Open-Meteo' });
    expect(source).toHaveAttribute('href', 'https://open-meteo.com');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('exibiu o relógio no formato HH:MM', async () => {
    mockFetchCountryConditions.mockResolvedValue(conditions);

    render(<ConditionsCard country={brazil} />);

    // O relógio é escrito no DOM em macrotarefa: aguarda o valor aparecer.
    await waitFor(() => {
      const clock = screen.getByTestId('local-time');
      expect(clock.textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('não descreveu código de tempo desconhecido', async () => {
    mockFetchCountryConditions.mockResolvedValue({
      ...conditions,
      weatherCode: 123,
    });

    render(<ConditionsCard country={brazil} />);

    expect(await screen.findByText('27,4°C')).toBeInTheDocument();
    expect(screen.queryByText(/nublado/)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('rotulou o local aproximado quando sem geocoding', async () => {
    mockFetchCountryConditions.mockResolvedValue({
      ...conditions,
      place: 'Centro do país',
      isCapital: false,
    });

    render(<ConditionsCard country={brazil} />);

    expect(await screen.findByText('Centro do país')).toBeInTheDocument();
  });

  it('exibiu a mensagem de erro quando o serviço falha', async () => {
    mockFetchCountryConditions.mockRejectedValue(
      new Error('Clima indisponível no momento.'),
    );

    render(<ConditionsCard country={brazil} />);

    expect(
      await screen.findByText('Clima indisponível no momento.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toBeInTheDocument();
  });
});
