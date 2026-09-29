/**
 * Módulo de comunicação com a API REST Countries.
 * Centraliza todas as chamadas HTTP e tratamento de erros.
 *
 * API utilizada: https://restcountries.com/v3.1/
 * - Gratuita, sem necessidade de autenticação
 * - Retorna dados completos de todos os países
 */

import type { Country } from '../types/country';

const BASE_URL = 'https://restcountries.com/v3.1';

/**
 * Busca todos os países com campos selecionados para otimizar payload.
 * Campos escolhidos cobrem: nome, bandeira, capital, região, população, área, idiomas, moedas.
 */
export async function fetchAllCountries(): Promise<Country[]> {
  const response = await fetch(
    `${BASE_URL}/all?fields=name,cca3,region,subregion,population,area,flags,coatOfArms,capital,languages,currencies,latlng,borders,independent,unMember,landlocked,continents,timezones,startOfWeek,flag`
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar países: ${response.status}`);
  }

  return response.json();
}

/**
 * Busca países pelo nome (parcial ou completo).
 * Utiliza o endpoint de busca por nome da API.
 */
export async function searchCountries(query: string): Promise<Country[]> {
  const response = await fetch(
    `${BASE_URL}/name/${query}?fields=name,cca3,region,subregion,population,area,flags,coatOfArms,capital,languages,currencies,latlng,borders,independent,unMember,landlocked,continents,timezones,startOfWeek,flag`
  );

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Erro na busca: ${response.status}`);
  }

  return response.json();
}

/**
 * Busca um país específico pelo código alpha3 (CCA3).
 */
export async function fetchCountryByCode(code: string): Promise<Country> {
  const response = await fetch(
    `${BASE_URL}/alpha/${code}?fields=name,cca3,region,subregion,population,area,flags,coatOfArms,capital,languages,currencies,latlng,borders,independent,unMember,landlocked,continents,timezones,startOfWeek,flag`
  );

  if (!response.ok) {
    throw new Error(`País não encontrado: ${code}`);
  }

  return response.json();
}
