// CoinGecko API — free public tier, no key required when accessed server-side
// Docs: https://docs.coingecko.com/reference/introduction
// Proxied through Vite: /api/coingecko/* → https://api.coingecko.com/api/v3/*

const BASE_URL = '/api/coingecko';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function apiFetch(url: string): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
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
      if (i < attempts - 1) await delay(800 * (i + 1));
      else throw err;
    }
  }
  throw new Error('All retries exhausted');
}

// ── Types ───────────────────────────────────────────────────────
export interface CoinAsset {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface CoinDetailData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  supply: number;
  maxSupply: number | null;
  image: string;
}

export interface CoinHistoryPoint {
  date: string;
  price: number;
  [key: string]: unknown;
}

// ── Public API ──────────────────────────────────────────────────
export const getTopCoins = async (limit = 50): Promise<CoinAsset[]> =>
  withRetry(async () => {
    const data: any[] = await apiFetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
    );
    return data.map(a => ({
      id: a.id,
      rank: a.market_cap_rank ?? 0,
      symbol: (a.symbol || '').toUpperCase(),
      name: a.name,
      current_price: a.current_price ?? 0,
      price_change_percentage_24h: a.price_change_percentage_24h ?? 0,
      market_cap: a.market_cap ?? 0,
      total_volume: a.total_volume ?? 0,
      image: a.image ?? '',
    }));
  });

export const getCoinDetail = async (id: string): Promise<CoinDetailData> =>
  withRetry(async () => {
    const a = await apiFetch(
      `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
    );
    const md = a.market_data ?? {};
    return {
      id: a.id,
      rank: a.market_cap_rank ?? 0,
      symbol: (a.symbol || '').toUpperCase(),
      name: a.name,
      current_price: md.current_price?.usd ?? 0,
      price_change_percentage_24h: md.price_change_percentage_24h ?? 0,
      market_cap: md.market_cap?.usd ?? 0,
      supply: md.circulating_supply ?? 0,
      maxSupply: md.max_supply ?? null,
      image: a.image?.large ?? a.image?.small ?? '',
    };
  });

export const getCoinHistory = async (
  id: string,
  days: number = 30,
): Promise<CoinHistoryPoint[]> =>
  withRetry(async () => {
    // CoinGecko auto-selects interval: daily for >90d, hourly for ≤90d
    const interval = days <= 90 ? 'daily' : 'daily';
    const data = await apiFetch(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
    );

    const pts: [number, number][] = data.prices ?? [];
    // Downsample to ≤ 300 points so charts stay fast
    const step = Math.max(1, Math.floor(pts.length / 300));
    return pts
      .filter((_, i) => i % step === 0)
      .map(([time, price]) => ({
        date: new Date(time).toLocaleDateString(),
        price: parseFloat(price.toFixed(8)),
      }));
  });
