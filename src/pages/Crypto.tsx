import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getTopCoins, type CoinAsset } from '../services/coinCapApi';
import PageWrapper from '../components/Layout/PageWrapper';

export default function Crypto() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<CoinAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getTopCoins(50)
      .then(setCoins)
      .catch(() => setError('Could not load crypto data. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = coins.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageWrapper maxWidth="1200px">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '48px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Crypto Markets
          </h1>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', opacity: 0.75 }}>
            Top 50 cryptocurrencies by market cap · Prices in USD
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: '260px' }}>
          <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text" placeholder="Search crypto…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '28px', padding: '16px 20px', borderRadius: '14px', backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ fontSize: '14px' }}>{error}</span>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--negative)', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ height: '180px', borderRadius: '20px', backgroundColor: 'var(--bg-card)' }} className="animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', gap: '12px' }}>
          <Search size={36} />
          <p>{search ? `No results for "${search}"` : 'No data loaded'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {filtered.map(coin => {
            const up = coin.price_change_percentage_24h >= 0;
            return (
              <button
                key={coin.id}
                onClick={() => navigate(`/crypto/${coin.id}`)}
                style={{ textAlign: 'left', padding: '24px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                {/* Coin header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={coin.image} alt={coin.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'white', position: 'absolute', top: 0, left: 0 }}>
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <span style={{ position: 'absolute', bottom: '-2px', right: '-4px', fontSize: '9px', fontWeight: 700, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '999px', padding: '1px 4px', border: '1px solid var(--border)' }}>
                      #{coin.rank}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coin.name}</p>
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '2px' }}>{coin.symbol}</p>
                  </div>
                  {/* 24h badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, color: up ? 'var(--positive)' : 'var(--negative)', backgroundColor: up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
                  </div>
                </div>

                {/* Price */}
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ${coin.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                    maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
                  })}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Mkt Cap: ${(coin.market_cap / 1_000_000_000).toFixed(2)}B
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Vol 24h: ${(coin.total_volume / 1_000_000_000).toFixed(2)}B
                </p>
              </button>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
