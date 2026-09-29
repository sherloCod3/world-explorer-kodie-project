/**
 * Regiões suportadas pela aplicação.
 *
 * Fonte única do conjunto de regiões: o FilterBar exibe estas opções e a camada
 * de API normaliza os valores recebidos para este mesmo conjunto.
 * Com isso, toda região retornada pela API é selecionável no filtro.
 */

/** Opções exibidas no filtro de região. "All" significa sem filtro. */
export const REGIONS = [
  'All',
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctic',
] as const;

/**
 * Nomes alternativos usados pela API para a região "Antarctic".
 * A API retorna "Polar" (Antarctica) e "Antarctic Ocean" (Bouvet Island).
 */
const REGION_ALIASES: Record<string, string> = {
  Polar: 'Antarctic',
  'Antarctic Ocean': 'Antarctic',
};

/**
 * Normaliza o campo region da API para uma das regiões suportadas.
 * Retorna string vazia quando o valor recebido não é texto.
 */
export function normalizeRegion(value: unknown): string {
  const region = typeof value === 'string' ? value : '';
  return REGION_ALIASES[region] ?? region;
}
