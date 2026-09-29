/**
 * Componente Footer — rodapé da aplicação.
 * Contém: informações sobre a API utilizada e créditos.
 */

import { Globe, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              World Explorer
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Dados fornecidos por{' '}
            <a
              href="https://restcountries.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              REST Countries API
            </a>
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> usando React + Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
