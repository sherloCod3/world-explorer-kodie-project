/**
 * Componente FilterBar — barra de filtros e ordenação.
 * Contém: seletor de região e seletor de ordenação.
 *
 * Regiões disponíveis: todas as retornadas pela API + "Todas".
 * Ordenação: nome (A-Z/Z-A), população (maior/menor), área (maior/menor).
 */

import { Filter, SortAsc } from 'lucide-react';

interface FilterBarProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
}

const REGIONS = [
  'All',
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctic',
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nome (A-Z)' },
  { value: 'name-desc', label: 'Nome (Z-A)' },
  { value: 'population-desc', label: 'População (maior)' },
  { value: 'population-asc', label: 'População (menor)' },
  { value: 'area-desc', label: 'Área (maior)' },
  { value: 'area-asc', label: 'Área (menor)' },
];

export function FilterBar({
  selectedRegion,
  onRegionChange,
  sortBy,
  onSortChange,
  totalResults,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* Filtro de região */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Filtrar por região"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region === 'All' ? 'Todas as regiões' : region}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Ordenar resultados"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {totalResults} {totalResults === 1 ? 'país encontrado' : 'países encontrados'}
      </p>
    </div>
  );
}
