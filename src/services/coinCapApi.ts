// CoinCap API — free, no key required, generous rate limits
// Docs: https://docs.coincap.io

const BASE_URL = '/api/coincap';

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
    const data = await apiFetch(`${BASE_URL}/assets?limit=${limit}`);
    return data.data.map((a: any) => ({
      id: a.id,
      rank: parseInt(a.rank) || 0,
      symbol: (a.symbol || '').toUpperCase(),
      name: a.name,
      current_price: parseFloat(a.priceUsd) || 0,
      price_change_percentage_24h: parseFloat(a.changePercent24Hr) || 0,
      market_cap: parseFloat(a.marketCapUsd) || 0,
      total_volume: parseFloat(a.volumeUsd24Hr) || 0,
      image: `https://assets.coincap.io/assets/icons/${(a.symbol || '').toLowerCase()}@2x.png`,
    }));
  });

export const getCoinDetail = async (id: string): Promise<CoinDetailData> =>
  withRetry(async () => {
    const data = await apiFetch(`${BASE_URL}/assets/${id}`);
    const a = data.data;
    return {
      id: a.id,
      rank: parseInt(a.rank) || 0,
      symbol: (a.symbol || '').toUpperCase(),
      name: a.name,
      current_price: parseFloat(a.priceUsd) || 0,
      price_change_percentage_24h: parseFloat(a.changePercent24Hr) || 0,
      market_cap: parseFloat(a.marketCapUsd) || 0,
      supply: parseFloat(a.supply) || 0,
      maxSupply: a.maxSupply ? parseFloat(a.maxSupply) : null,
      image: `https://assets.coincap.io/assets/icons/${(a.symbol || '').toLowerCase()}@2x.png`,
    };
  });

export const getCoinHistory = async (
  id: string,
  days: number = 30,
): Promise<CoinHistoryPoint[]> =>
  withRetry(async () => {
    const endMs = Date.now();
    const startMs = endMs - days * 86_400_000;

    // CoinCap interval: h1 for ≤2d, h2 for ≤7d, d1 for longer
    const interval = days <= 2 ? 'h1' : days <= 7 ? 'h2' : 'd1';

    const data = await apiFetch(
      `${BASE_URL}/assets/${id}/history?interval=${interval}&start=${startMs}&end=${endMs}`,
    );

    const pts: any[] = data.data ?? [];
    // Downsample to ≤ 300 points so charts stay fast
    const step = Math.max(1, Math.floor(pts.length / 300));
    return pts
      .filter((_, i) => i % step === 0)
      .map(p => ({
        date: new Date(p.time).toLocaleDateString(),
        price: parseFloat(parseFloat(p.priceUsd).toFixed(8)),
      }));
  });
