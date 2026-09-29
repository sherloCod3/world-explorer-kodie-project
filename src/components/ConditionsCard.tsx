/**
 * Cartão de clima e horário local de um país (seção "Para viajar").
 *
 * Busca as condições na montagem (hook useConditions). O cartão é renderizado
 * com key igual ao código do país: ao navegar para um vizinho, o cartão é
 * remontado e nunca exibe dados do país anterior.
 *
 * Estados: carregando, indisponível (erro do serviço) e sucesso.
 * O relógio usa o fuso IANA recebido e é atualizado a cada 30 segundos.
 * Dados ausentes (umidade, vento, nascer/pôr do sol) simplesmente não são
 * exibidos — nada é inventado.
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sunrise,
  Sunset,
  Sun,
  Wind,
} from 'lucide-react';
import type { Country } from '../types/country';
import { useConditions } from '../hooks/useConditions';
import { describeWeather } from '../utils/conditions';

/** Ícone correspondente ao código meteorológico WMO. */
function WeatherIcon({ code, className }: { code: number; className: string }) {
  if (code <= 1) return <Sun className={className} aria-hidden="true" />;
  if (code === 2) return <CloudSun className={className} aria-hidden="true" />;
  if (code === 3) return <Cloud className={className} aria-hidden="true" />;
  if (code === 45 || code === 48) {
    return <CloudFog className={className} aria-hidden="true" />;
  }
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle className={className} aria-hidden="true" />;
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={className} aria-hidden="true" />;
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <CloudSnow className={className} aria-hidden="true" />;
  }
  if (code >= 95) return <CloudLightning className={className} aria-hidden="true" />;
  return <Cloud className={className} aria-hidden="true" />;
}

/**
 * Escreve a hora atual no fuso informado diretamente no DOM, a cada 30s.
 * Sem estado do React: o relógio não causa re-render nem atualizações fora
 * de act() nos testes. O primeiro valor é agendado em macrotarefa.
 */
function useLocalClock(
  timezone: string | undefined,
  ref: RefObject<HTMLSpanElement>,
): void {
  useEffect(() => {
    const write = (): void => {
      if (!ref.current) return;
      if (!timezone) {
        ref.current.textContent = '';
        return;
      }
      try {
        ref.current.textContent = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: timezone,
        }).format(new Date());
      } catch {
        // Fuso inválido: mantém o relógio vazio, sem derrubar o cartão.
        ref.current.textContent = '';
      }
    };

    const first = setTimeout(write, 0);
    const interval = setInterval(write, 30000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [timezone, ref]);
}

/** Extrai "HH:MM" de uma data no formato local "AAAA-MM-DDTHH:MM". */
function localTime(dateTime: string): string {
  return dateTime.slice(11, 16);
}

/** Rodapé de atribuição da fonte de dados. */
function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <span className="block mt-1 text-[11px] text-gray-400">
      Fonte:{' '}
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
        {label}
      </a>
    </span>
  );
}

export function ConditionsCard({ country }: { country: Country }) {
  const { state, error, conditions } = useConditions(country);
  const clockRef = useRef<HTMLSpanElement>(null);
  useLocalClock(conditions?.timezone, clockRef);

  if (state === 'loading') {
    return (
      <div
        role="status"
        className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-500 dark:text-gray-400"
      >
        Carregando clima…
      </div>
    );
  }

  if (state === 'error' || !conditions) {
    return (
      <div
        role="status"
        className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-500 dark:text-gray-400"
      >
        {error ?? 'Clima indisponível.'}
        <SourceLink href="https://open-meteo.com" label="Open-Meteo" />
      </div>
    );
  }

  const label =
    conditions.weatherCode !== undefined
      ? describeWeather(conditions.weatherCode)
      : undefined;

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 text-xs text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-2 mb-1">
        {conditions.weatherCode !== undefined && (
          <WeatherIcon
            code={conditions.weatherCode}
            className="w-5 h-5 text-blue-500"
          />
        )}
        {conditions.temperatureC !== undefined && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {conditions.temperatureC.toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            })}
            °C
          </span>
        )}
        {label && <span>{label}</span>}
      </div>

      <p className="mb-1.5 font-medium text-gray-900 dark:text-white">
        {conditions.place}
      </p>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {conditions.timezone && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span ref={clockRef} data-testid="local-time" />
          </span>
        )}
        {conditions.humidity !== undefined && (
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            Umidade {conditions.humidity}%
          </span>
        )}
        {conditions.windKmh !== undefined && (
          <span className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            Vento{' '}
            {conditions.windKmh.toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            })}{' '}
            km/h
          </span>
        )}
        {conditions.sunrise && (
          <span className="flex items-center gap-1">
            <Sunrise className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            Nascer {localTime(conditions.sunrise)}
          </span>
        )}
        {conditions.sunset && (
          <span className="flex items-center gap-1">
            <Sunset className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            Pôr {localTime(conditions.sunset)}
          </span>
        )}
      </div>

      <SourceLink href="https://open-meteo.com" label="Open-Meteo" />
    </div>
  );
}
