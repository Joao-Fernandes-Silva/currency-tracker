import axios from 'axios';
import type { ExchangeRate, HistoricalRate } from '../types';

const BASE_URL = 'https://api.frankfurter.app';

export const SUPPORTED_CURRENCIES: Record<string, string> = {
  AUD: 'Australian Dollar',
  BGN: 'Bulgarian Lev',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli Shekel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Króna',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Zloty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  ZAR: 'South African Rand',
};

export const CURRENCY_FLAGS: Record<string, string> = {
  AUD: '🇦🇺', BGN: '🇧🇬', BRL: '🇧🇷', CAD: '🇨🇦', CHF: '🇨🇭',
  CNY: '🇨🇳', CZK: '🇨🇿', DKK: '🇩🇰', EUR: '🇪🇺', GBP: '🇬🇧',
  HKD: '🇭🇰', HUF: '🇭🇺', IDR: '🇮🇩', ILS: '🇮🇱', INR: '🇮🇳',
  ISK: '🇮🇸', JPY: '🇯🇵', KRW: '🇰🇷', MXN: '🇲🇽', MYR: '🇲🇾',
  NOK: '🇳🇴', NZD: '🇳🇿', PHP: '🇵🇭', PLN: '🇵🇱', RON: '🇷🇴',
  SEK: '🇸🇪', SGD: '🇸🇬', THB: '🇹🇭', TRY: '🇹🇷', USD: '🇺🇸',
  ZAR: '🇿🇦',
};

export const getLatestRates = async (base: string): Promise<ExchangeRate> => {
  const { data } = await axios.get(`${BASE_URL}/latest?from=${base}`);
  return data;
};

export const getHistoricalRates = async (
  base: string,
  target: string,
  days: number = 30
): Promise<HistoricalRate[]> => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const { data } = await axios.get(
    `${BASE_URL}/${fmt(start)}..${fmt(end)}?from=${base}&to=${target}`
  );

  return Object.entries(data.rates).map(([date, rates]) => ({
    date,
    rate: (rates as Record<string, number>)[target],
  }));
};
