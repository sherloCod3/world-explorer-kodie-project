/**
 * Componente CountryGrid — grid responsivo de cards de países.
 * Utiliza CSS Grid com colunas adaptativas.
 *
 * Estados:
 * - Lista vazia (sem resultados): exibe mensagem amigável
 * - Com resultados: exibe grid de CountryCard
 */

import type { Country } from '../types/country';
import { CountryCard } from './CountryCard';
import { SearchX } from 'lucide-react';

interface CountryGridProps {
  countries: Country[];
  isFavorite: (code: string) => boolean;
  onToggleFavorite: (code: string) => void;
  onSelectCountry: (country: Country) => void;
  isFavoritesView: boolean;
}

export function CountryGrid({
  countries,
  isFavorite,
  onToggleFavorite,
  onSelectCountry,
  isFavoritesView,
}: CountryGridProps) {
  if (countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <SearchX className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isFavoritesView
            ? 'Nenhum favorito ainda'
            : 'Nenhum país encontrado'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          {isFavoritesView
            ? 'Clique no coração de um país para adicioná-lo aos favoritos.'
            : 'Tente ajustar os filtros ou buscar por outro nome.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {countries.map((country) => (
        <CountryCard
          key={country.cca3}
          country={country}
          isFavorite={isFavorite(country.cca3)}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelectCountry}
        />
      ))}
    </div>
  );
}
