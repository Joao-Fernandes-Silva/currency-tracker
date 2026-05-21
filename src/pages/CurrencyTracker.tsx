import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Bell, RefreshCw, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLatestRates, getHistoricalRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import PageWrapper from '../components/Layout/PageWrapper';
import type { HistoricalRate } from '../types';

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '28px',
};

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

  const numAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? numAmount * rate : null;
  const atTarget = targetValue && rate ? rate >= parseFloat(targetValue) : false;
  const availableCurrencies = Object.keys(SUPPORTED_CURRENCIES).filter(c => c !== mainCurrency);

  const periodChange =
    history.length >= 2
      ? ((history[history.length - 1].rate - history[0].rate) / history[0].rate) * 100
      : null;

  const inputBox: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
  };

  return (
    <PageWrapper maxWidth="860px">
      {/* Page header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
          Currency Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Live conversion from{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{mainCurrency}</strong>
          {' '}· Change your base currency in settings ⚙
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '24px',
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

      {/* ── Converter card ─────────────────────────────────────── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Convert</span>
          {lastUpdated && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Rate date: {lastUpdated}
            </span>
          )}
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '28px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Amount · {mainCurrency}
            </label>
            <div style={inputBox}>
              <span style={{ fontSize: '22px' }}>{CURRENCY_FLAGS[mainCurrency] || '🌐'}</span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ paddingBottom: '14px', color: 'var(--text-secondary)' }}>
            <ArrowRightLeft size={20} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Target Currency
            </label>
            <div style={inputBox}>
              <span style={{ fontSize: '22px' }}>{CURRENCY_FLAGS[targetCurrency] || '🌐'}</span>
              <select
                value={targetCurrency}
                onChange={e => setTargetCurrency(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
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

        {/* Result panel */}
        <div
          style={{
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(56,189,248,0.08) 100%)',
            border: '1px solid rgba(139,92,246,0.28)',
          }}
        >
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {numAmount} {mainCurrency} =
            </p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', height: '52px' }}>
                <RefreshCw size={18} className="animate-spin" /> Fetching rates…
              </div>
            ) : (
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                {converted !== null
                  ? converted.toLocaleString(undefined, { maximumFractionDigits: 4 })
                  : '—'}
                <span style={{ fontSize: '1.4rem', marginLeft: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {targetCurrency}
                </span>
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Exchange rate</p>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              1 {mainCurrency} = {rate?.toFixed(4) ?? '…'} {targetCurrency}
            </p>
            {periodChange !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'flex-end',
                  marginTop: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: periodChange >= 0 ? 'var(--positive)' : 'var(--negative)',
                }}
              >
                {periodChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(periodChange).toFixed(2)}% ({days}d)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Price target card ────────────────────────────────── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Bell size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Price Target</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
          Set a rate you'd like to monitor. We'll highlight when the market reaches your target.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${atTarget ? 'var(--positive)' : 'var(--border)'}`,
            transition: 'border-color 0.3s',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            1 {mainCurrency} =
          </span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder={rate ? (rate * 1.05).toFixed(2) : '0.00'}
            value={targetValue}
            onChange={e => setTargetValue(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {targetCurrency}
          </span>
        </div>

        {targetValue && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: atTarget ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.08)',
              color: atTarget ? 'var(--positive)' : 'var(--accent)',
              border: `1px solid ${atTarget ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
            }}
          >
            {atTarget
              ? <><CheckCircle size={15} /> Target reached! Current rate ({rate?.toFixed(4)}) ≥ {targetValue} {targetCurrency}</>
              : <><Bell size={15} /> Watching · current {rate?.toFixed(4)}, target {targetValue} {targetCurrency}</>}
          </div>
        )}
      </div>

      {/* ── Historical chart card ─────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Historical Rate
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              1 {mainCurrency} → {targetCurrency} over time
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: days === d ? 'none' : '1px solid var(--border)',
                  backgroundColor: days === d ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: days === d ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
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
          <div
            style={{
              height: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} className="animate-spin" /> Loading chart…
              </span>
            ) : 'No data available'}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
