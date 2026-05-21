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
  const [weekChange, setWeekChange] = useState<number | null>(null);

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
          const change = ((last - first) / first) * 100;
          if (period === 7) setWeekChange(change);
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
    <div className="flex-1 px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
      {/* Back */}
      <Link
        to="/currencies"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Back to Currencies
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{CURRENCY_FLAGS[code || ''] || '🏳️'}</span>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {code}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {SUPPORTED_CURRENCIES[code || ''] || 'Unknown Currency'}
          </p>
        </div>
        {weekChange !== null && (
          <div
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold"
            style={{
              color: weekChange >= 0 ? 'var(--positive)' : 'var(--negative)',
              backgroundColor: weekChange >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            }}
          >
            {weekChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(weekChange).toFixed(2)}% (7d)
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: `Current Rate`, value: rate?.toFixed(4) ?? '—', sub: `1 ${mainCurrency}` },
          { label: 'Period High', value: maxRate.toFixed(4), sub: `${history.length}d high` },
          { label: 'Period Low', value: minRate.toFixed(4), sub: `${history.length}d low` },
          { label: 'Average', value: avgRate.toFixed(4), sub: `${history.length}d avg` },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Rate History
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              1 {mainCurrency} in {code} · {lastUpdated}
            </p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
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
          <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            Loading chart…
          </div>
        ) : (
          <LineChartComponent data={history} dataKey="rate" />
        )}
      </div>

      {/* Quick convert */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Reference
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 5, 10, 50, 100, 500, 1000, 5000].map(amt => (
            <div
              key={amt}
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                {amt} {mainCurrency}
              </p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {rate ? (amt * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} {code}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
