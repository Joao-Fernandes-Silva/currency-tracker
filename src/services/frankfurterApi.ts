import type { ExchangeRate, HistoricalRate } from '../types';

const BASE_URL = '/api/frankfurter';

export const SUPPORTED_CURRENCIES: Record<string, string> = {
  AUD: 'Australian Dollar',   BGN: 'Bulgarian Lev',
  BRL: 'Brazilian Real',      CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',         CNY: 'Chinese Yuan',
  CZK: 'Czech Koruna',        DKK: 'Danish Krone',
  EUR: 'Euro',                GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',   HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',   ILS: 'Israeli Shekel',
  INR: 'Indian Rupee',        ISK: 'Icelandic Króna',
  JPY: 'Japanese Yen',        KRW: 'South Korean Won',
  MXN: 'Mexican Peso',        MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',     NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',     PLN: 'Polish Zloty',
  RON: 'Romanian Leu',        SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',   THB: 'Thai Baht',
  TRY: 'Turkish Lira',        USD: 'US Dollar',
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

export const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'A$', BGN: 'лв', BRL: 'R$', CAD: 'C$', CHF: 'Fr',
  CNY: '¥',  CZK: 'Kč', DKK: 'kr', EUR: '€',  GBP: '£',
  HKD: 'HK$',HUF: 'Ft', IDR: 'Rp', ILS: '₪',  INR: '₹',
  ISK: 'kr',  JPY: '¥',  KRW: '₩',  MXN: '$',  MYR: 'RM',
  NOK: 'kr',  NZD: 'NZ$',PHP: '₱',  PLN: 'zł', RON: 'lei',
  SEK: 'kr',  SGD: 'S$', THB: '฿',  TRY: '₺',  USD: '$',
  ZAR: 'R',
};

// Major world currencies — shown first in all selectors
export const MAJOR_CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY',
  'HKD', 'SGD', 'NZD', 'NOK', 'SEK', 'DKK', 'INR', 'MXN',
];

// ── Native fetch wrapper (avoids axios quirks) ──────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function apiFetch(url: string): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      if (i < attempts - 1) await delay(700 * (i + 1));
      else throw err;
    }
  }
  throw new Error('All retries exhausted');
}

// ── Public API ──────────────────────────────────────────────────
export const getLatestRates = async (base: string): Promise<ExchangeRate> =>
  withRetry(() => apiFetch(`${BASE_URL}/latest?from=${base}`));

export const getHistoricalRates = async (
  base: string,
  target: string,
  days: number = 30,
): Promise<HistoricalRate[]> =>
  withRetry(async () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const data = await apiFetch(
      `${BASE_URL}/${fmt(start)}..${fmt(end)}?from=${base}&to=${target}`,
    );

    if (!data.rates) return [];
    return Object.entries(data.rates).map(([date, rates]) => ({
      date,
      rate: (rates as Record<string, number>)[target] ?? 0,
    }));
  });
