import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLatestRates, getHistoricalRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import type { HistoricalRate } from '../types';

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
];

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
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [latest, hist] = await Promise.all([
          getLatestRates(mainCurrency),
          getHistoricalRates(mainCurrency, code, period),
        ]);
        setRate(latest.rates[code] ?? null);
        setLastUpdated(latest.date);
        setHistory(hist);

        if (hist.length >= 2) {
          const first = hist[0].rate;
          const last = hist[hist.length - 1].rate;
          setPeriodChange(((last - first) / first) * 100);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [code, mainCurrency, period]);

  const minRate = history.length ? Math.min(...history.map(h => h.rate)) : 0;
  const maxRate = history.length ? Math.max(...history.map(h => h.rate)) : 0;
  const avgRate = history.length ? history.reduce((s, h) => s + h.rate, 0) / history.length : 0;

  return (
    <div className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">

      <Link
        to="/currencies"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={15} /> Back to Currencies
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <span className="text-5xl">{CURRENCY_FLAGS[code || ''] || '🏳️'}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold gradient-text">{code}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{SUPPORTED_CURRENCIES[code || ''] || 'Unknown'}</p>
        </div>
        {periodChange !== null && (
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold"
            style={{
              color: periodChange >= 0 ? 'var(--positive)' : 'var(--negative)',
              backgroundColor: periodChange >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${periodChange >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {periodChange >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {Math.abs(periodChange).toFixed(2)}%
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Current Rate', value: rate?.toFixed(4) ?? '—', accent: true },
          { label: `${period}d High`, value: maxRate.toFixed(4) },
          { label: `${period}d Low`, value: minRate.toFixed(4) },
          { label: `${period}d Average`, value: avgRate.toFixed(4) },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rate History</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              1 {mainCurrency} → {code} · {lastUpdated}
            </p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: period === p.days ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: period === p.days ? 'white' : 'var(--text-secondary)',
                  border: period === p.days ? 'none' : '1px solid var(--border)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            Loading chart…
          </div>
        ) : (
          <LineChartComponent data={history} dataKey="rate" color="var(--accent)" />
        )}
      </div>

      {/* Quick reference */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Reference</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 5, 10, 50, 100, 500, 1000, 5000].map(amt => (
            <div
              key={amt}
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{amt} {mainCurrency}</p>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {rate ? (amt * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} {code}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
