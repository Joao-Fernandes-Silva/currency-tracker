import axios from 'axios';
import type { CryptoAsset } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getTopCryptos = async (vsCurrency = 'usd', perPage = 50): Promise<CryptoAsset[]> => {
  const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
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
};

export const getCryptoDetail = async (id: string) => {
  const { data } = await axios.get(`${BASE_URL}/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  });
  return data;
};

export const getCryptoHistory = async (
  id: string,
  vsCurrency = 'usd',
  days: number = 30
): Promise<{ date: string; price: number }[]> => {
  const { data } = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
    params: { vs_currency: vsCurrency, days, interval: days <= 1 ? 'hourly' : 'daily' },
  });
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    price: parseFloat(price.toFixed(6)),
  }));
};
