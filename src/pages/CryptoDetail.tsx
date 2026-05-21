import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getCoinDetail, getCoinHistory, type CoinDetailData, type CoinHistoryPoint } from '../services/coinCapApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import PageWrapper from '../components/Layout/PageWrapper';

const PERIODS = [
  { label: '24h', days: 1 },
  { label: '7d',  days: 7 },
  { label: '1M',  days: 30 },
  { label: '3M',  days: 90 },
  { label: '1Y',  days: 365 },
  { label: '3Y',  days: 1095 },
];

const card: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '20px', padding: '28px', marginBottom: '24px',
};

export default function CryptoDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<CoinDetailData | null>(null);
  const [history, setHistory] = useState<CoinHistoryPoint[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getCoinDetail(id)
      .then(setDetail)
      .catch(() => setError('Could not load coin data. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setChartLoading(true);
    getCoinHistory(id, period)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [id, period]);

  // Compute period stats from history
  const minPrice = history.length ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length ? Math.max(...history.map(h => h.price)) : 0;
  const periodChange = history.length >= 2
    ? ((history[history.length - 1].price - history[0].price) / history[0].price) * 100
    : null;

  if (loading) return (
    <PageWrapper maxWidth="860px">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px', color: 'var(--text-secondary)', gap: '12px' }}>
        <RefreshCw size={20} className="animate-spin" /> Loading…
      </div>
    </PageWrapper>
  );

  if (error || !detail) return (
    <PageWrapper maxWidth="860px">
      <Link to="/crypto" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '36px' }}>
        <ArrowLeft size={15} /> Back to Crypto
      </Link>
      <div style={{ padding: '40px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {error || 'Coin not found.'}
      </div>
    </PageWrapper>
  );

  const up24h = detail.price_change_percentage_24h >= 0;
  const upPeriod = (periodChange ?? 0) >= 0;

  return (
    <PageWrapper maxWidth="860px">
      <Link to="/crypto" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '36px' }}>
        <ArrowLeft size={15} /> Back to Crypto
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={detail.image} alt={detail.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }}
          />
          <div style={{ display: 'none', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent)', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: 'white', position: 'absolute', top: 0, left: 0 }}>
            {detail.symbol.slice(0, 2)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{detail.name}</h1>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
            {detail.symbol} · Rank #{detail.rank}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            ${detail.current_price.toLocaleString(undefined, {
              minimumFractionDigits: detail.current_price < 1 ? 4 : 2,
              maximumFractionDigits: detail.current_price < 1 ? 6 : 2,
            })}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '14px', fontWeight: 700, color: up24h ? 'var(--positive)' : 'var(--negative)' }}>
            {up24h ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {up24h ? '+' : ''}{detail.price_change_percentage_24h.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '24h Change', value: `${up24h ? '+' : ''}${detail.price_change_percentage_24h.toFixed(2)}%`, color: up24h ? 'var(--positive)' : 'var(--negative)' },
          { label: `${PERIODS.find(p=>p.days===period)?.label ?? period+'d'} Change`, value: periodChange !== null ? `${upPeriod ? '+' : ''}${periodChange.toFixed(2)}%` : '—', color: upPeriod ? 'var(--positive)' : 'var(--negative)' },
          { label: 'Market Cap', value: `$${(detail.market_cap / 1e9).toFixed(2)}B`, color: 'var(--text-primary)' },
          { label: 'Circulating Supply', value: `${(detail.supply / 1e6).toFixed(2)}M ${detail.symbol}`, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={card}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Price History (USD)</h2>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <button key={p.days} onClick={() => setPeriod(p.days)} style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: period === p.days ? 'none' : '1px solid var(--border)', backgroundColor: period === p.days ? 'var(--accent)' : 'var(--bg-secondary)', color: period === p.days ? 'white' : 'var(--text-secondary)' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '10px' }}>
            <RefreshCw size={16} className="animate-spin" /> Loading chart…
          </div>
        ) : history.length > 0 ? (
          <LineChartComponent data={history} dataKey="price" color="#fb923c" />
        ) : (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No data available</div>
        )}
      </div>

      {/* Period high / low */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Period High</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--positive)' }}>
            ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
        <div style={card}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Period Low</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--negative)' }}>
            ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
