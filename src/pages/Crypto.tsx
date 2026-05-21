import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { getTopCryptos } from '../services/coinGeckoApi';
import type { CryptoAsset } from '../types';
import { SparklineChart } from '../components/Charts/SparklineChart';
import PageWrapper from '../components/Layout/PageWrapper';

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
    <PageWrapper maxWidth="1200px">

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
            Crypto Markets
          </h1>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', opacity: 0.75, marginTop: '4px' }}>
            Top 50 cryptocurrencies by market cap · Prices in USD
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            minWidth: '260px',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search crypto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '28px',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            color: 'var(--negative)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{ height: '200px', borderRadius: '20px', backgroundColor: 'var(--bg-card)' }}
              className="animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '80px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            gap: '12px',
          }}
        >
          <Search size={36} />
          <p>No results for "{search}"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {filtered.map((coin, idx) => {
            const change24h = coin.price_change_percentage_24h ?? 0;
            const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
            const sparkData = coin.sparkline_in_7d?.price ?? [];
            const positive7d = change7d >= 0;

            return (
              <button
                key={coin.id}
                onClick={() => navigate(`/crypto/${coin.id}`)}
                style={{
                  textAlign: 'left',
                  padding: '24px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                {/* Coin header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={coin.image} alt={coin.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-4px',
                        fontSize: '9px',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        borderRadius: '999px',
                        padding: '1px 4px',
                        lineHeight: 1.4,
                        border: '1px solid var(--border)',
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {coin.name}
                    </p>
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {coin.symbol}
                    </p>
                  </div>
                  {/* 24h badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: change24h >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(change24h).toFixed(1)}%
                  </div>
                </div>

                {/* Price */}
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ${coin.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                    maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                  })}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Mkt Cap: ${(coin.market_cap / 1_000_000_000).toFixed(2)}B
                </p>

                {/* Sparkline */}
                {sparkData.length > 0 && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>7d chart</span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: positive7d ? 'var(--positive)' : 'var(--negative)',
                        }}
                      >
                        {change7d >= 0 ? '+' : ''}{change7d.toFixed(2)}%
                      </span>
                    </div>
                    <SparklineChart data={sparkData} positive={positive7d} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
