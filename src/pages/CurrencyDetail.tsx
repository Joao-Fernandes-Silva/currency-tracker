import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLatestRates, getHistoricalRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import PageWrapper from '../components/Layout/PageWrapper';
import type { HistoricalRate } from '../types';

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
];

const card: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '28px',
  marginBottom: '24px',
};

export default function CurrencyDetail() {
  const { code } = useParams<{ code: string }>();
  const { mainCurrency } = useApp();
  const [rate, setRate] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoricalRate[]>([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [periodChange, setPeriodChange] = useState<number | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    Promise.all([
      getLatestRates(mainCurrency),
      getHistoricalRates(mainCurrency, code, period),
    ])
      .then(([latest, hist]) => {
        setRate(latest.rates[code] ?? null);
        setLastUpdated(latest.date);
        setHistory(hist);
        if (hist.length >= 2) {
          const first = hist[0].rate;
          const last = hist[hist.length - 1].rate;
          setPeriodChange(((last - first) / first) * 100);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [code, mainCurrency, period]);

  const minRate = history.length ? Math.min(...history.map(h => h.rate)) : 0;
  const maxRate = history.length ? Math.max(...history.map(h => h.rate)) : 0;
  const avgRate = history.length ? history.reduce((s, h) => s + h.rate, 0) / history.length : 0;

  return (
    <PageWrapper maxWidth="860px">
      <Link
        to="/currencies"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '36px',
        }}
      >
        <ArrowLeft size={15} /> Back to Currencies
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '56px' }}>{CURRENCY_FLAGS[code || ''] || '🏳️'}</span>
        <div style={{ flex: 1 }}>
          <h1 className="gradient-text" style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>
            {code}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            {SUPPORTED_CURRENCIES[code || ''] || 'Unknown Currency'}
          </p>
        </div>
        {periodChange !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '999px',
              fontWeight: 700,
              color: periodChange >= 0 ? 'var(--positive)' : 'var(--negative)',
              backgroundColor: periodChange >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${periodChange >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {periodChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(periodChange).toFixed(2)}%
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Current Rate', value: rate?.toFixed(4) ?? '—', accent: true },
          { label: `${period}d High`, value: maxRate.toFixed(4) },
          { label: `${period}d Low`, value: minRate.toFixed(4) },
          { label: `${period}d Average`, value: avgRate.toFixed(4) },
        ].map(stat => (
          <div key={stat.label} style={card}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Rate History
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              1 {mainCurrency} → {code} · {lastUpdated}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
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
        {loading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Loading chart…
          </div>
        ) : (
          <LineChartComponent data={history} dataKey="rate" color="var(--accent)" />
        )}
      </div>

      {/* Quick reference */}
      <div style={{ ...card, marginBottom: 0 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
          Quick Reference
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[1, 5, 10, 50, 100, 500, 1000, 5000].map(amt => (
            <div
              key={amt}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{amt} {mainCurrency}</p>
              <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                {rate ? (amt * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} {code}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
