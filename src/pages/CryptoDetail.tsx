import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { getCryptoDetail, getCryptoHistory } from '../services/coinGeckoApi';
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
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '28px',
  marginBottom: '24px',
};

export default function CryptoDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [history, setHistory] = useState<{ date: string; price: number }[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCryptoDetail(id).then(setDetail).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setChartLoading(true);
    getCryptoHistory(id, 'usd', period)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [id, period]);

  if (loading) {
    return (
      <PageWrapper maxWidth="860px">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
          Loading…
        </div>
      </PageWrapper>
    );
  }

  if (!detail) {
    return (
      <PageWrapper maxWidth="860px">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
          Coin not found.
        </div>
      </PageWrapper>
    );
  }

  const price = detail.market_data?.current_price?.usd;
  const change24h = detail.market_data?.price_change_percentage_24h_in_currency?.usd ?? 0;
  const change7d = detail.market_data?.price_change_percentage_7d_in_currency?.usd ?? 0;
  const change30d = detail.market_data?.price_change_percentage_30d_in_currency?.usd ?? 0;
  const ath = detail.market_data?.ath?.usd;
  const minPrice = history.length ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length ? Math.max(...history.map(h => h.price)) : 0;

  return (
    <PageWrapper maxWidth="860px">
      <Link
        to="/crypto"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '36px',
        }}
      >
        <ArrowLeft size={15} /> Back to Crypto
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <img src={detail.image?.large} alt={detail.name} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{detail.name}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600 }}>
            {detail.symbol}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            ${price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px',
              fontSize: '14px', fontWeight: 700,
              color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)',
            }}
          >
            {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '24h Change', value: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`, color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: '7d Change', value: `${change7d >= 0 ? '+' : ''}${change7d.toFixed(2)}%`, color: change7d >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: '30d Change', value: `${change30d >= 0 ? '+' : ''}${change30d.toFixed(2)}%`, color: change30d >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: 'All-Time High', value: `$${ath?.toLocaleString(undefined, { maximumFractionDigits: 4 })}`, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={card}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Price History (USD)</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                style={{
                  padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  border: period === p.days ? 'none' : '1px solid var(--border)',
                  backgroundColor: period === p.days ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: period === p.days ? 'white' : 'var(--text-secondary)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Loading chart…
          </div>
        ) : (
          <LineChartComponent data={history} dataKey="price" color="#fb923c" />
        )}
      </div>

      {/* Period high/low */}
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

      {/* Description */}
      {detail.description?.en && (
        <div style={{ ...card, marginBottom: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
            About {detail.name}
          </h2>
          <p
            style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{
              __html: detail.description.en
                .split('\r\n\r\n')[0]
                .replace(/<a[^>]*>/g, '')
                .replace(/<\/a>/g, ''),
            }}
          />
        </div>
      )}
    </PageWrapper>
  );
}
