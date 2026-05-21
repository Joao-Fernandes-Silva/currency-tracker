import axios from 'axios';
import type { CryptoAsset } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 800): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await delay(backoff);
    return fetchWithRetry(fn, retries - 1, backoff * 1.5);
  }
}

export const getTopCryptos = async (vsCurrency = 'usd', perPage = 50): Promise<CryptoAsset[]> => {
  return fetchWithRetry(async () => {
    const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
      timeout: 15000,
      params: {
        vs_currency: vsCurrency,
        order: 'market_cap_desc',
        per_page: perPage,
        page: 1,
        sparkline: true,
        price_change_percentage: '7d',
      },
    });
    return data;
  });
};

export const getCryptoDetail = async (id: string) => {
  return fetchWithRetry(async () => {
    const { data } = await axios.get(`${BASE_URL}/coins/${id}`, {
      timeout: 15000,
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
    });
    return data;
  });
};

export const getCryptoHistory = async (
  id: string,
  vsCurrency = 'usd',
  days: number = 30
): Promise<{ date: string; price: number }[]> => {
  return fetchWithRetry(async () => {
    const { data } = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
      timeout: 20000,
      params: {
        vs_currency: vsCurrency,
        days,
        interval: days <= 1 ? 'hourly' : 'daily',
      },
    });
    // Downsample large datasets so charts stay fast
    const prices: [number, number][] = data.prices;
    const step = Math.max(1, Math.floor(prices.length / 200));
    return prices
      .filter((_, i) => i % step === 0)
      .map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        price: parseFloat(price.toFixed(6)),
      }));
  });
};
