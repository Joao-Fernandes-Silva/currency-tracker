import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Bell, RefreshCw, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLatestRates, getHistoricalRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import type { HistoricalRate } from '../types';

export default function CurrencyTracker() {
  const { mainCurrency } = useApp();
  const [targetCurrency, setTargetCurrency] = useState('CZK');
  const [rate, setRate] = useState<number | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [amount, setAmount] = useState('1');
  const [history, setHistory] = useState<HistoricalRate[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = useCallback(async () => {
    if (mainCurrency === targetCurrency) return;
    setLoading(true);
    setError('');
    try {
      const [latest, hist] = await Promise.all([
        getLatestRates(mainCurrency),
        getHistoricalRates(mainCurrency, targetCurrency, days),
      ]);
      setRate(latest.rates[targetCurrency] ?? null);
      setLastUpdated(latest.date);
      setHistory(hist);
    } catch {
      setError('Could not fetch rates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mainCurrency, targetCurrency, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live conversion — computed from state on every render
  const numAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? (numAmount * rate) : null;

  const atTarget = targetValue && rate
    ? rate >= parseFloat(targetValue)
    : false;

  const availableCurrencies = Object.keys(SUPPORTED_CURRENCIES).filter(c => c !== mainCurrency);

  const periodChange = history.length >= 2
    ? ((history[history.length - 1].rate - history[0].rate) / history[0].rate) * 100
    : null;

  return (
    <div className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 gradient-text">Currency Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Live conversion from <strong style={{ color: 'var(--text-primary)' }}>{mainCurrency}</strong> · Change your base currency in settings.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Converter card ─────────────────────────────────────────── */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Convert</span>
          {lastUpdated && (
            <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>Updated: {lastUpdated}</span>
          )}
        </div>

        {/* Inputs row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch mb-5">
          {/* Amount */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
              Amount · {mainCurrency}
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <span className="text-xl">{CURRENCY_FLAGS[mainCurrency] || '🌐'}</span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-transparent text-lg font-semibold outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-end pb-3.5 px-1" style={{ color: 'var(--text-secondary)' }}>
            <ArrowRightLeft size={18} />
          </div>

          {/* Target currency */}
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
              Target Currency
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <span className="text-xl">{CURRENCY_FLAGS[targetCurrency] || '🌐'}</span>
              <select
                value={targetCurrency}
                onChange={e => setTargetCurrency(e.target.value)}
                className="flex-1 bg-transparent text-base font-semibold cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                {availableCurrencies.map(code => (
                  <option key={code} value={code} style={{ backgroundColor: 'var(--bg-card)' }}>
                    {code} — {SUPPORTED_CURRENCIES[code]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result */}
        <div
          className="rounded-xl p-5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(56,189,248,0.08) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              {numAmount} {mainCurrency} =
            </p>
            {loading ? (
              <div className="flex items-center gap-2 h-10" style={{ color: 'var(--text-secondary)' }}>
                <RefreshCw size={16} className="animate-spin" />
                <span>Fetching rates…</span>
              </div>
            ) : (
              <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                {converted !== null
                  ? converted.toLocaleString(undefined, { maximumFractionDigits: 4 })
                  : '—'}
                <span className="text-xl ml-2" style={{ color: 'var(--text-secondary)' }}>{targetCurrency}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Rate</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
              1 {mainCurrency} = {rate?.toFixed(4) ?? '…'} {targetCurrency}
            </p>
            {periodChange !== null && (
              <div
                className="flex items-center gap-1 justify-end mt-1 text-xs font-semibold"
                style={{ color: periodChange >= 0 ? 'var(--positive)' : 'var(--negative)' }}
              >
                {periodChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(periodChange).toFixed(2)}% ({days}d)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Price Target card ────────────────────────────────────────── */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Price Target</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Enter your desired rate below — we'll highlight when the market reaches it.
        </p>
        <div className="flex gap-3">
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: `1px solid ${atTarget ? 'var(--positive)' : 'var(--border)'}`,
              transition: 'border-color 0.3s',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              1 {mainCurrency} =
            </span>
            <input
              type="number"
              min="0"
              step="any"
              placeholder={`e.g. ${rate ? (rate * 1.05).toFixed(2) : '25.00'}`}
              value={targetValue}
              onChange={e => setTargetValue(e.target.value)}
              className="flex-1 bg-transparent font-semibold outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {targetCurrency}
            </span>
          </div>
        </div>

        {targetValue && (
          <div
            className="mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor: atTarget ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.08)',
              color: atTarget ? 'var(--positive)' : 'var(--accent)',
              border: `1px solid ${atTarget ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
            }}
          >
            {atTarget
              ? <><CheckCircle size={15} /> Target reached! Rate ({rate?.toFixed(4)}) ≥ your target of {targetValue}</>
              : <><Bell size={15} /> Watching · current rate {rate?.toFixed(4)}, target {targetValue} {targetCurrency}</>
            }
          </div>
        )}
      </div>

      {/* ── Historical chart card ────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Historical Rate</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              1 {mainCurrency} → {targetCurrency} over time
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: days === d ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: days === d ? 'white' : 'var(--text-secondary)',
                  border: days === d ? 'none' : '1px solid var(--border)',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {history.length > 0 ? (
          <LineChartComponent data={history} dataKey="rate" color="var(--accent)" />
        ) : (
          <div className="h-64 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            {loading ? <><RefreshCw size={16} className="animate-spin mr-2" />Loading chart…</> : 'No data available'}
          </div>
        )}
      </div>
    </div>
  );
}
