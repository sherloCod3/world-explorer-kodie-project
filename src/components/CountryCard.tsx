/**
 * Componente CountryCard — card individual de país na listagem.
 * Exibe: bandeira, nome, capital, região e população.
 *
 * Interações:
 * - Clique no card: abre modal de detalhes
 * - Botão de coração: adiciona/remove dos favoritos
 *
 * Acessibilidade: role="article", aria-label com nome do país.
 */

import { Heart, MapPin, Users } from 'lucide-react';
import type { Country } from '../types/country';

interface CountryCardProps {
  country: Country;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelect: (country: Country) => void;
}

/**
 * Formata números grandes com separador de milhar.
 * Ex: 1400000 → "1.400.000"
 */
function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function CountryCard({
  country,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: CountryCardProps) {
  return (
    <article
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1"
      onClick={() => onSelect(country)}
      role="article"
      aria-label={`País: ${country.name.common}`}
    >
      {/* Bandeira */}
      <div className="relative h-40 sm:h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={country.flags.svg || country.flags.png}
          alt={`Bandeira de ${country.name.common}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Botão de favorito sobreposto */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(country.cca3);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm hover:scale-110 transition-transform"
          aria-label={
            isFavorite
              ? `Remover ${country.name.common} dos favoritos`
              : `Adicionar ${country.name.common} aos favoritos`
          }
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Informações */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate mb-2">
          {country.name.common}
        </h3>

        <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
          {country.capital && country.capital[0] && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{country.capital[0]}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
              {country.region}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{formatNumber(country.population)} hab.</span>
          </div>
        </div>
      </div>
    </article>
  );
}
