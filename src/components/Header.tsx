/**
 * Componente Header — cabeçalho principal da aplicação.
 * Contém: logo/título, barra de busca, toggle de favoritos e toggle de tema.
 *
 * Design: fixo no topo, com fundo semi-transparente e blur.
 * Responsivo: busca ocupa largura total em mobile.
 */

import { Globe, Heart, Search, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  favoritesCount,
  showFavorites,
  onToggleFavorites,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo e título */}
          <div className="flex items-center gap-2 shrink-0">
            <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              World Explorer
            </h1>
          </div>

          {/* Barra de busca */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                aria-label="Buscar país por nome"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle de tema */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Botão de favoritos */}
            <button
              onClick={onToggleFavorites}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                showFavorites
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-300 dark:ring-red-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label={showFavorites ? 'Ver todos os países' : 'Ver favoritos'}
              title={showFavorites ? 'Ver todos os países' : 'Ver favoritos'}
            >
              <Heart
                className={`w-4 h-4 ${showFavorites ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span className="hidden sm:inline">
                {favoritesCount > 0 ? `(${favoritesCount})` : 'Favoritos'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
