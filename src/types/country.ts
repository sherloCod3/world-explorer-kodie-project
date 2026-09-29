/**
 * Tipos TypeScript para os dados da API REST Countries.
 * Definidos conforme a estrutura de resposta da API v3.
 */

/** Idioma falado no país */
export interface Language {
  name: string;
  nativeName?: string;
}

/** Moeda utilizada no país */
export interface Currency {
  name: string;
  symbol: string;
}

/** Informações de bandeira do país */
export interface Flag {
  png: string;
  svg: string;
  alt?: string;
}

/** Informações de brasão do país */
export interface CoatOfArms {
  png: string;
  svg: string;
}

/** Dados de localização (latitude/longitude) */
export interface LatLang {
  lat: number;
  lng: number;
}

/** Informações de fuso horário */
export interface TimeZone {
  utc: string[];
}

/** Estrutura completa do país retornada pela API */
export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca3: string;
  ccn3?: string;
  region: string;
  subregion?: string;
  population: number;
  area: number;
  flags: Flag;
  coatOfArms?: CoatOfArms;
  capital?: string[];
  languages: Record<string, string>;
  currencies: Record<string, Currency>;
  latlng: number[];
  borders?: string[];
  independent?: boolean;
  unMember?: boolean;
  landlocked: boolean;
  continents: string[];
  timezones: string[];
  startOfWeek?: string;
  flag: string;
}

/** Estados possíveis para requisições assíncronas */
export type RequestState = 'idle' | 'loading' | 'success' | 'error';
