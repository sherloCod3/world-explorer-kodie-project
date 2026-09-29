/**
 * Tipos das informações auxiliares exibidas no modal (câmbio e condições).
 * Não fazem parte do contrato principal de países.
 */

/** Cotação de câmbio com base em reais (BRL). */
export interface ExchangeRates {
  /** Código da moeda base ("BRL"). */
  base: string;
  /** Valor de 1 unidade da base em cada moeda: rates["EUR"] = 0,168… */
  rates: Record<string, number>;
  /** Data e hora da última atualização, no formato da API. */
  updatedAt: string;
}

/** Condições atuais de um país (clima na capital ou no centro do país). */
export interface Conditions {
  /** Local exibido: nome da capital ou "Centro do país". */
  place: string;
  /** Indica se o local veio do geocoding da capital (senão, é o centro). */
  isCapital: boolean;
  /** Fuso IANA (ex.: "America/Sao_Paulo"), quando conhecido. */
  timezone?: string;
  /** Temperatura em graus Celsius. */
  temperatureC?: number;
  /** Código meteorológico WMO (0-99). */
  weatherCode?: number;
  /** Umidade relativa em % (0-100). */
  humidity?: number;
  /** Velocidade do vento em km/h. */
  windKmh?: number;
  /** Nascer do sol no formato local "AAAA-MM-DDTHH:MM". */
  sunrise?: string;
  /** Pôr do sol no formato local "AAAA-MM-DDTHH:MM". */
  sunset?: string;
}
