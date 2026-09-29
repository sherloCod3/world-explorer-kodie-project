/**
 * Cartão de cotação de câmbio com conversão de reais (seção "Para viajar").
 *
 * Mostra "1 BRL ≈ X {moeda}" e permite converter um valor em reais para a
 * moeda local. Exibe a data da atualização, pois a API troca a cotação uma
 * vez ao dia. Sem cotação para a moeda, o cartão não é renderizado.
 */
import { useState } from 'react';
import { Coins } from 'lucide-react';
import type { Currency } from '../types/country';
import { useExchangeRate } from '../hooks/useExchangeRate';

interface ExchangeCardProps {
  /** Código da moeda local (ex.: "EUR"). */
  code: string;
  /** Dados da moeda local, para rótulo amigável. */
  currency: Currency;
}

/**
 * Aceita "100", "10,5" e "10.5". Devolve null quando o texto não é um
 * valor válido — nesse caso nada é convertido, em vez de exibir número errado.
 */
function parseAmount(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Formata a taxa com precisão razoável (evita 0,16882800000000002). */
function formatRate(rate: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumSignificantDigits: 4,
  }).format(rate);
}

/** Formata um valor na moeda informada; cai para número + código se inválido. */
function formatMoney(value: number, code: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: code,
    }).format(value);
  } catch {
    const number = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2,
    }).format(value);
    return `${number} ${code}`;
  }
}

/** Interpreta a data da API; devolve null quando não é reconhecida. */
function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ExchangeCard({ code, currency }: ExchangeCardProps) {
  const { state, error, quote } = useExchangeRate(code);
  const [amount, setAmount] = useState('100');
  const parsed = parseAmount(amount);

  if (state === 'loading') {
    return (
      <div
        role="status"
        className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-500 dark:text-gray-400"
      >
        Carregando cotação…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        role="status"
        className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-500 dark:text-gray-400"
      >
        {error ?? 'Cotação indisponível.'}
        <span className="block mt-1 text-[11px] text-gray-400">
          Fonte:{' '}
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            ExchangeRate-API
          </a>
        </span>
      </div>
    );
  }

  // Sucesso sem cotação (moeda sem taxa na API): não há informação a exibir.
  if (!quote) return null;

  const updatedAt = parseDate(quote.updatedAt);

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
        <Coins className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
        <span className="text-sm font-semibold">
          1 BRL ≈ {formatRate(quote.rate)} {code}
        </span>
      </div>

      <label htmlFor="exchange-amount" className="block mb-1 text-gray-500 dark:text-gray-400">
        Valor em reais (R$)
      </label>
      <input
        id="exchange-amount"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Ex.: 100"
        className="w-28 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p
        aria-live="polite"
        data-testid="exchange-result"
        className="mt-2 font-medium text-gray-900 dark:text-white"
      >
        {parsed !== null
          ? `≈ ${formatMoney(parsed * quote.rate, code)}`
          : 'Informe um valor válido.'}
      </p>

      <p className="mt-1.5 text-[11px] text-gray-400">
        {updatedAt && (
          <>
            Atualizada em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'UTC',
            }).format(updatedAt)}{' '}
            (UTC) ·{' '}
          </>
        )}
        Fonte:{' '}
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          ExchangeRate-API
        </a>
        {` · ${currency.name}`}
      </p>
    </div>
  );
}
