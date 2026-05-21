import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { getTopCryptos } from '../services/coinGeckoApi';
import type { CryptoAsset } from '../types';

export default function Crypto() {
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopCryptos('usd', 50)
      .then(setCryptos)
      .catch(() => setError('Failed to load crypto data. CoinGecko free tier may be rate-limited — try again shortly.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cryptos.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 px-4 md:px-8 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Crypto Markets
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Top 50 cryptocurrencies by market cap</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search crypto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Table header */}
          <div
            className="hidden md:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>#</span>
            <span>Name</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h %</span>
            <span className="text-right">7d %</span>
            <span className="text-right">Market Cap</span>
          </div>

          <div className="space-y-2">
            {filtered.map((coin, idx) => {
              const change24h = coin.price_change_percentage_24h;
              const change7d = coin.price_change_percentage_7d_in_currency;
              return (
                <button
                  key={coin.id}
                  onClick={() => navigate(`/crypto/${coin.id}`)}
                  className="w-full text-left p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full" />
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{coin.name}</p>
                      <p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>{coin.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)' }}
                      >
                        {change24h >= 0 ? '+' : ''}{change24h?.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{coin.name}</p>
                        <p className="text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>{coin.symbol}</p>
                      </div>
                    </div>
                    <p className="text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${coin.current_price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1" style={{ color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      {change24h >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      <span className="text-sm font-medium">{Math.abs(change24h).toFixed(2)}%</span>
                    </div>
                    <div
                      className="flex items-center justify-end gap-1"
                      style={{ color: (change7d ?? 0) >= 0 ? 'var(--positive)' : 'var(--negative)' }}
                    >
                      {(change7d ?? 0) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      <span className="text-sm font-medium">{Math.abs(change7d ?? 0).toFixed(2)}%</span>
                    </div>
                    <p className="text-right text-sm" style={{ color: 'var(--text-secondary)' }}>
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
