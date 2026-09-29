/**
 * App — componente raiz da aplicação World Explorer.
 *
 * Responsabilidades:
 * - Orquestra estado global (dados, filtros, favoritos, modal)
 * - Conecta hooks customizados aos componentes de UI
 * - Gerencia visualização de favoritos vs. todos os países
 * - Controla modal de detalhes do país
 *
 * Arquitetura:
 * - useCountries: busca e filtra dados da API
 * - useFavorites: gerencia favoritos com persistência local
 * - Componentes de UI: Header, FilterBar, CountryGrid, CountryDetail, Footer
 */

import { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CountryGrid } from './components/CountryGrid';
import { CountryDetail } from './components/CountryDetail';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { Footer } from './components/Footer';
import { useCountries } from './hooks/useCountries';
import { useFavorites } from './hooks/useFavorites';
import { useTheme } from './hooks/useTheme';
import type { Country } from './types/country';

export default function App() {
  const {
    countries,
    filteredCountries,
    state,
    error,
    searchQuery,
    selectedRegion,
    sortBy,
    setSearchQuery,
    setSelectedRegion,
    setSortBy,
    refetch,
  } = useCountries();

  const { favorites, isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const { theme, toggleTheme } = useTheme();

  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  /**
   * Filtra países favoritos a partir da lista já filtrada por busca/região.
   * Isso permite combinar busca + filtro de região + favoritos.
   */
  const displayedCountries = useMemo(() => {
    if (!showFavorites) return filteredCountries;
    return filteredCountries.filter((c) => favorites.includes(c.cca3));
  }, [filteredCountries, showFavorites, favorites]);

  /**
   * Busca países vizinhos do país selecionado no modal.
   * Utiliza os dados já carregados para evitar requisições extras.
   */
  const neighborCountries = useMemo(() => {
    if (!selectedCountry?.borders?.length) return [];
    return countries.filter((c) => selectedCountry.borders!.includes(c.cca3));
  }, [selectedCountry, countries]);

  /**
   * Navega para país vizinho no modal.
   * Busca o país completo na lista já carregada.
   */
  const handleSelectNeighbor = useCallback(
    (code: string) => {
      const neighbor = countries.find((c) => c.cca3 === code);
      if (neighbor) {
        setSelectedCountry(neighbor);
      }
    },
    [countries]
  );

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Cabeçalho fixo */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favoritesCount}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Título da seção */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {showFavorites ? 'Meus Favoritos' : 'Explore o Mundo'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {showFavorites
              ? 'Países que você salvou para consulta rápida.'
              : 'Descubra informações sobre países de todo o mundo.'}
          </p>
        </div>

        {/* Estados de carregamento e erro */}
        {state === 'loading' && <LoadingState />}
        {state === 'error' && error && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {/* Conteúdo quando dados disponíveis */}
        {state === 'success' && (
          <>
            {/* Barra de filtros (oculta na view de favoritos) */}
            {!showFavorites && (
              <FilterBar
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={displayedCountries.length}
              />
            )}

            {showFavorites && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {displayedCountries.length}{' '}
                {displayedCountries.length === 1 ? 'favorito' : 'favoritos'}
              </p>
            )}

            {/* Grid de países */}
            <CountryGrid
              countries={displayedCountries}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onSelectCountry={setSelectedCountry}
              isFavoritesView={showFavorites}
            />
          </>
        )}
      </main>

      {/* Rodapé */}
      <Footer />

      {/* Modal de detalhes */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          isFavorite={isFavorite(selectedCountry.cca3)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedCountry(null)}
          onSelectNeighbor={handleSelectNeighbor}
          neighbors={neighborCountries}
        />
      )}
    </div>
  );
}
