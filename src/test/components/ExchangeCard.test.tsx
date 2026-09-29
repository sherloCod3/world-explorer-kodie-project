/**
 * Testes do componente ExchangeCard (câmbio e conversor).
 *
 * Cobertura:
 * - Estado de carregamento e estado de erro
 * - Linha de cotação e conversão com o valor padrão
 * - Conversão ao digitar valor com ponto ou vírgula
 * - Valor inválido (nada é convertido)
 * - Moeda sem cotação (cartão não é renderizado)
 * - Atribuição da fonte e data da atualização
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExchangeCard } from '../../components/ExchangeCard';
import { fetchExchangeRates } from '../../utils/exchange';

vi.mock('../../utils/exchange', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/exchange')>();
  return { ...actual, fetchExchangeRates: vi.fn() };
});

const mockFetchExchangeRates = vi.mocked(fetchExchangeRates);

const ratesPayload = {
  base: 'BRL',
  rates: { BRL: 1, EUR: 0.168828 },
  updatedAt: 'Tue, 29 Sep 2026 00:02:31 +0000',
};

const props = {
  code: 'EUR',
  currency: { name: 'Euro', symbol: '€' },
};

describe('ExchangeCard', () => {
  beforeEach(() => {
    mockFetchExchangeRates.mockReset();
  });

  it('exibiu o carregamento enquanto busca', () => {
    mockFetchExchangeRates.mockReturnValue(new Promise(() => {}));

    render(<ExchangeCard {...props} />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando cotação…');
  });

  it('exibiu a cotação e converteu o valor padrão', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    render(<ExchangeCard {...props} />);

    expect(await screen.findByText('1 BRL ≈ 0,1688 EUR')).toBeInTheDocument();

    // 100 BRL × 0,168828 = 16,88 EUR (formato pt-BR usa vírgula decimal).
    const result = screen.getByTestId('exchange-result');
    expect(result.textContent).toContain('16,88');
    expect(screen.getByLabelText('Valor em reais (R$)')).toHaveValue('100');
  });

  it('recalculou a conversão ao digitar outro valor', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    render(<ExchangeCard {...props} />);
    const input = await screen.findByLabelText('Valor em reais (R$)');

    fireEvent.change(input, { target: { value: '250' } });

    // 250 BRL × 0,168828 = 42,21 EUR.
    expect(screen.getByTestId('exchange-result').textContent).toContain('42,21');
  });

  it('aceitou vírgula decimal (padrão brasileiro)', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    render(<ExchangeCard {...props} />);
    const input = await screen.findByLabelText('Valor em reais (R$)');

    fireEvent.change(input, { target: { value: '10,5' } });

    // 10,5 BRL × 0,168828 = 1,77 EUR.
    expect(screen.getByTestId('exchange-result').textContent).toContain('1,77');
  });

  it('não converteu valor inválido', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    render(<ExchangeCard {...props} />);
    const input = await screen.findByLabelText('Valor em reais (R$)');

    fireEvent.change(input, { target: { value: 'abc' } });

    expect(screen.getByTestId('exchange-result')).toHaveTextContent(
      'Informe um valor válido.',
    );
  });

  it('exibiu a data da atualização e a fonte', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    render(<ExchangeCard {...props} />);

    await screen.findByText('1 BRL ≈ 0,1688 EUR');

    expect(screen.getByText(/Atualizada em/)).toBeInTheDocument();
    const source = screen.getByRole('link', { name: 'ExchangeRate-API' });
    expect(source).toHaveAttribute('href', 'https://www.exchangerate-api.com');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('não renderizou nada quando a moeda não tem cotação', async () => {
    mockFetchExchangeRates.mockResolvedValue(ratesPayload);

    const { container } = render(<ExchangeCard code="XYZ" currency={props.currency} />);

    // Conclui sem cotação (XYZ não existe nos rates) e some do modal.
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it('exibiu a mensagem de erro quando a API falha', async () => {
    mockFetchExchangeRates.mockRejectedValue(
      new Error('Cotação indisponível no momento.'),
    );

    render(<ExchangeCard {...props} />);

    expect(
      await screen.findByText('Cotação indisponível no momento.'),
    ).toBeInTheDocument();
  });
});
