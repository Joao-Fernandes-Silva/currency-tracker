export interface Currency {
  code: string;
  name: string;
  flag?: string;
}

export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface HistoricalRate {
  date: string;
  rate: number;
  [key: string]: unknown;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CryptoDetail extends CryptoAsset {
  description?: { en: string };
  market_data?: {
    current_price: { usd: number; eur: number };
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_24h_in_currency: { usd: number };
    price_change_percentage_7d_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
  };
}

export type Theme = 'dark' | 'light';
