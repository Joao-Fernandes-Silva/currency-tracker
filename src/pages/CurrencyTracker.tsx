import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Bell, RefreshCw, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getLatestRates, getHistoricalRates,
  SUPPORTED_CURRENCIES, CURRENCY_FLAGS, MAJOR_CURRENCY_CODES,
} from '../services/frankfurterApi';
import LineChartComponent from '../components/Charts/LineChartComponent';
import PageWrapper from '../components/Layout/PageWrapper';
import type { HistoricalRate } from '../types';

const PERIODS = [
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
  const [histLoading, setHistLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch latest rate
  const fetchRate = useCallback(async () => {
    if (mainCurrency === targetCurrency) return;
    setLoading(true);
    setError('');
    try {
      const latest = await getLatestRates(mainCurrency);
      setRate(latest.rates[targetCurrency] ?? null);
      setLastUpdated(latest.date);
    } catch {
      setError('Could not fetch the exchange rate. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [mainCurrency, targetCurrency]);

  // Fetch history separately so rate shows even if chart fails
  const fetchHistory = useCallback(async () => {
    if (mainCurrency === targetCurrency) return;
    setHistLoading(true);
    try {
      const hist = await getHistoricalRates(mainCurrency, targetCurrency, days);
      setHistory(hist);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, [mainCurrency, targetCurrency, days]);

  useEffect(() => { fetchRate(); }, [fetchRate]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const numAmount = parseFloat(amount) || 0;
  const converted = rate !== null ? numAmount * rate : null;
  const atTarget = targetValue && rate ? rate >= parseFloat(targetValue) : false;

  const periodChange =
    history.length >= 2
      ? ((history[history.length - 1].rate - history[0].rate) / history[0].rate) * 100
      : null;

  // Build sorted currency list: majors first, then rest alphabetically
  const allCodes = Object.keys(SUPPORTED_CURRENCIES).filter(c => c !== mainCurrency);
  const majors = MAJOR_CURRENCY_CODES.filter(c => allCodes.includes(c));
  const others = allCodes.filter(c => !MAJOR_CURRENCY_CODES.includes(c)).sort();
  // sortedCurrencies is used via majors + others in the optgroups below

  const inputBox: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px 20px', borderRadius: '14px',
    backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
  };

  return (
    <PageWrapper maxWidth="860px">
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
          Currency Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Live conversion from <strong style={{ color: 'var(--text-primary)' }}>{mainCurrency}</strong>
          {' '}· Change your base in <strong style={{ color: 'var(--text-primary)' }}>Settings ⚙</strong>
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '14px 18px', borderRadius: '12px', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Converter ─────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Convert</span>
          {lastUpdated && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Rate date: {lastUpdated}
            </span>
          )}
        </div>

        {/* Inputs — slight right offset with paddingLeft */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '28px', paddingLeft: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '-0.01em' }}>
              Amount · {mainCurrency}
            </label>
            <div style={inputBox}>
              <span style={{ fontSize: '24px' }}>{CURRENCY_FLAGS[mainCurrency] || '🌐'}</span>
              <input
                type="number" min="0" step="any"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ paddingBottom: '16px', color: 'var(--text-secondary)' }}>
            <ArrowRightLeft size={20} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '-0.01em' }}>
              Target Currency
            </label>
            <div style={inputBox}>
              <span style={{ fontSize: '24px' }}>{CURRENCY_FLAGS[targetCurrency] || '🌐'}</span>
              <select
                value={targetCurrency}
                onChange={e => setTargetCurrency(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <optgroup label="── Major Currencies" style={{ backgroundColor: 'var(--bg-card)' }}>
                  {majors.map(code => (
                    <option key={code} value={code} style={{ backgroundColor: 'var(--bg-card)' }}>
                      {code} — {SUPPORTED_CURRENCIES[code]}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="── All Currencies" style={{ backgroundColor: 'var(--bg-card)' }}>
                  {others.map(code => (
                    <option key={code} value={code} style={{ backgroundColor: 'var(--bg-card)' }}>
                      {code} — {SUPPORTED_CURRENCIES[code]}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Result */}
        <div style={{
          borderRadius: '16px', padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(56,189,248,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.28)',
        }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {numAmount} {mainCurrency} =
            </p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', height: '52px' }}>
                <RefreshCw size={18} className="animate-spin" /> Fetching…
              </div>
            ) : (
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                {converted !== null ? converted.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                <span style={{ fontSize: '1.4rem', marginLeft: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {targetCurrency}
                </span>
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Exchange rate</p>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
              1 {mainCurrency} = {rate?.toFixed(4) ?? '…'} {targetCurrency}
            </p>
            {periodChange !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '8px', fontSize: '13px', fontWeight: 700, color: periodChange >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {periodChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(periodChange).toFixed(2)}% ({days}d)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Price target ──────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Bell size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Price Target</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
          Set a rate you'd like to reach. We highlight when the market gets there.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px', borderRadius: '14px',
          backgroundColor: 'var(--bg-secondary)',
          border: `1px solid ${atTarget ? 'var(--positive)' : 'var(--border)'}`,
          transition: 'border-color 0.3s',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            1 {mainCurrency} =
          </span>
          <input
            type="number" min="0" step="any"
            placeholder={rate ? (rate * 1.05).toFixed(2) : '0.00'}
            value={targetValue} onChange={e => setTargetValue(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {targetCurrency}
          </span>
        </div>
        {targetValue && (
          <div style={{
            marginTop: '16px', padding: '14px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: atTarget ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.08)',
            color: atTarget ? 'var(--positive)' : 'var(--accent)',
            border: `1px solid ${atTarget ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
          }}>
            {atTarget
              ? <><CheckCircle size={15} /> Target reached! Current rate ({rate?.toFixed(4)}) ≥ {targetValue} {targetCurrency}</>
              : <><Bell size={15} /> Watching · current {rate?.toFixed(4)}, target {targetValue} {targetCurrency}</>}
          </div>
        )}
      </div>

      {/* ── History chart ─────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Historical Rate
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              1 {mainCurrency} → {targetCurrency} over time
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {PERIODS.map(p => (
              <button key={p.days} onClick={() => setDays(p.days)} style={{
                padding: '7px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: days === p.days ? 'none' : '1px solid var(--border)',
                backgroundColor: days === p.days ? 'var(--accent)' : 'var(--bg-secondary)',
                color: days === p.days ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {histLoading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} /> Loading chart…
          </div>
        ) : history.length > 0 ? (
          <LineChartComponent data={history} dataKey="rate" color="var(--accent)" />
        ) : (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            No chart data available
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
