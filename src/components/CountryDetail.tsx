/**
 * Componente CountryDetail — modal com informações detalhadas do país.
 * Exibe: bandeira, nome, capital, região, população, área, idiomas, moedas
 * e países vizinhos.
 *
 * Interações:
 * - Fechar: botão X ou clique fora do modal
 * - Favoritar: botão de coração
 * - Navegação: clique em país vizinho carrega seus dados
 *
 * Acessibilidade: role="dialog", aria-modal, foco no botão de fechar ao abrir,
 * ESC para fechar e bloqueio do scroll do body enquanto está aberto.
 *
 * Exibição condicional: campos que a API não fornece (continents, unMember,
 * landlocked) e listas vazias não são renderizados, evitando exibir informação
 * incorreta ao usuário.
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MapPin,
  Users,
  Globe,
  Mountain,
  Languages,
  Coins,
  Building2,
  Compass,
} from 'lucide-react';
import type { Country } from '../types/country';

interface CountryDetailProps {
  country: Country;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onClose: () => void;
  onSelectNeighbor: (code: string) => void;
  neighbors: Country[];
}

/**
 * Formata números grandes com separador de milhar.
 */
function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Formata área em km².
 */
function formatArea(area: number): string {
  return `${formatNumber(area)} km²`;
}

export function CountryDetail({
  country,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectNeighbor,
  neighbors,
}: CountryDetailProps) {
  /** Referência do botão de fechar, usada para posicionar o foco ao abrir. */
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Fecha modal ao pressionar ESC.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  /**
   * Move o foco para o botão de fechar ao abrir o modal,
   * permitindo fechar com o teclado sem usar o mouse.
   */
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const languages = Object.values(country.languages);
  const currencies = Object.values(country.currencies);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${country.name.common}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Conteúdo do modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header com bandeira */}
        <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-2xl">
          <img
            src={country.flags.svg || country.flags.png}
            alt={`Bandeira de ${country.name.common}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Botões de ação */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => onToggleFavorite(country.cca3)}
              className="p-2 rounded-full bg-white/90 dark:bg-gray-900/90 hover:scale-110 transition-transform"
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
              />
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-full bg-white/90 dark:bg-gray-900/90 hover:scale-110 transition-transform"
              aria-label="Fechar detalhes"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Nome sobre a bandeira */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {country.name.common}
            </h2>
            {/* A API não fornece nome oficial: a linha é omitida quando é igual ao comum. */}
            {country.name.official && country.name.official !== country.name.common && (
              <p className="text-white/80 text-sm mt-1">{country.name.official}</p>
            )}
          </div>
        </div>

        {/* Corpo do modal */}
        <div className="p-6 space-y-6">
          {/* Grid de informações principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Capital"
              value={country.capital?.join(', ') || 'Não informada'}
            />
            <InfoItem
              icon={<Globe className="w-4 h-4" />}
              label="Região"
              value={`${country.region}${country.subregion ? ` — ${country.subregion}` : ''}`}
            />
            <InfoItem
              icon={<Users className="w-4 h-4" />}
              label="População"
              value={`${formatNumber(country.population)} habitantes`}
            />
            <InfoItem
              icon={<Mountain className="w-4 h-4" />}
              label="Área"
              value={country.area > 0 ? formatArea(country.area) : 'Não informada'}
            />
            {/* Continente: exibido apenas quando a API informa o campo. */}
            {country.continents?.length ? (
              <InfoItem
                icon={<Compass className="w-4 h-4" />}
                label="Continente"
                value={country.continents.join(', ')}
              />
            ) : null}
            {/* Membro da ONU: exibido apenas quando a API informa o campo. */}
            {typeof country.unMember === 'boolean' && (
              <InfoItem
                icon={<Building2 className="w-4 h-4" />}
                label="Membro da ONU"
                value={country.unMember ? 'Sim' : 'Não'}
              />
            )}
          </div>

          {/* Idiomas — oculto quando a lista está vazia. */}
          {languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Idiomas
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Moedas — oculto quando a lista está vazia. */}
          {currencies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Moedas
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {currencies.map((currency) => (
                  <span
                    key={currency.name}
                    className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                  >
                    {currency.name}
                    {currency.symbol ? ` (${currency.symbol})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Países vizinhos */}
          {neighbors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Países Vizinhos
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {neighbors.map((neighbor) => (
                  <button
                    key={neighbor.cca3}
                    onClick={() => onSelectNeighbor(neighbor.cca3)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <img
                      src={neighbor.flags.svg || neighbor.flags.png}
                      alt=""
                      className="w-4 h-3 object-cover rounded-sm"
                    />
                    {neighbor.name.common}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Código: {country.cca3}</span>
              {/* Campos exibidos apenas quando a API informa o valor. */}
              {typeof country.landlocked === 'boolean' && (
                <span>Sem litoral: {country.landlocked ? 'Sim' : 'Não'}</span>
              )}
              {typeof country.independent === 'boolean' && (
                <span>Independente: {country.independent ? 'Sim' : 'Não'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-componente para exibir uma informação com ícone.
 */
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
