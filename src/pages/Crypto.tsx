import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { getTopCryptos } from '../services/coinGeckoApi';
import type { CryptoAsset } from '../types';
import { SparklineChart } from '../components/Charts/SparklineChart';

export default function Crypto() {
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopCryptos('usd', 50)
      .then(setCryptos)
      .catch(() =>
        setError('Failed to load crypto data. CoinGecko free tier may be rate-limited — try again in a moment.')
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = cryptos.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 px-4 py-10 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1 gradient-text">Crypto Markets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Top 50 cryptocurrencies by market cap · Prices in USD</p>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full md:w-72"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search crypto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Grid of cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Search size={32} style={{ color: 'var(--text-secondary)' }} className="mb-3" />
          <p style={{ color: 'var(--text-secondary)' }}>No results for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((coin, idx) => {
            const change24h = coin.price_change_percentage_24h ?? 0;
            const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
            const sparkData = coin.sparkline_in_7d?.price ?? [];
            const positive = change7d >= 0;

            return (
              <button
                key={coin.id}
                onClick={() => navigate(`/crypto/${coin.id}`)}
                className="group text-left p-5 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Rank + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full" />
                    <span
                      className="absolute -bottom-1 -right-1 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '9px' }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{coin.name}</p>
                    <p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>{coin.symbol}</p>
                  </div>
                  {/* 24h badge */}
                  <div
                    className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: change24h >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(change24h).toFixed(1)}%
                  </div>
                </div>

                {/* Price */}
                <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ${coin.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                    maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                  })}
                </p>

                {/* Market cap */}
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
                </p>

                {/* Sparkline */}
                {sparkData.length > 0 && (
                  <div className="mt-auto pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>7d chart</span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: positive ? 'var(--positive)' : 'var(--negative)' }}
                      >
                        {change7d >= 0 ? '+' : ''}{change7d.toFixed(2)}%
                      </span>
                    </div>
                    <SparklineChart data={sparkData} positive={positive} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
