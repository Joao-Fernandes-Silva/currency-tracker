import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Bell, RefreshCw } from 'lucide-react';
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
  const [lastUpdated, setLastUpdated] = useState('');
  const [alertSet, setAlertSet] = useState(false);

  const fetchData = useCallback(async () => {
    if (mainCurrency === targetCurrency) return;
    setLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        getLatestRates(mainCurrency),
        getHistoricalRates(mainCurrency, targetCurrency, days),
      ]);
      setRate(latest.rates[targetCurrency] ?? null);
      setLastUpdated(latest.date);
      setHistory(hist);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [mainCurrency, targetCurrency, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const converted = rate && amount ? (parseFloat(amount) * rate).toFixed(4) : '—';
  const atTarget = targetValue && rate ? rate >= parseFloat(targetValue) : false;
  const availableCurrencies = Object.keys(SUPPORTED_CURRENCIES).filter(c => c !== mainCurrency);

  return (
    <div className="flex-1 px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Currency Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track how much {mainCurrency} you can buy in another currency.
        </p>
      </div>

      {/* Main converter card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Amount input */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Amount ({mainCurrency})
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {CURRENCY_FLAGS[mainCurrency]}
              </span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-lg font-semibold outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center pb-3" style={{ color: 'var(--text-secondary)' }}>
            <ArrowRightLeft size={20} />
          </div>

          {/* Target currency select */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Target Currency
            </label>
            <select
              value={targetCurrency}
              onChange={e => setTargetCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-lg font-semibold outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {availableCurrencies.map(code => (
                <option key={code} value={code}>
                  {CURRENCY_FLAGS[code]} {code} — {SUPPORTED_CURRENCIES[code]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div
          className="mt-6 p-5 rounded-xl flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {loading ? (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <RefreshCw size={16} className="animate-spin" /> Fetching rates…
            </div>
          ) : (
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                {amount} {mainCurrency} =
              </p>
              <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                {converted} <span className="text-2xl">{targetCurrency}</span>
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Rate</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              1 {mainCurrency} = {rate?.toFixed(4)} {targetCurrency}
            </p>
            {lastUpdated && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Price alert card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Price Target
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Set a target rate. We'll highlight when the rate reaches your target.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder={`Target rate (1 ${mainCurrency} = ? ${targetCurrency})`}
            value={targetValue}
            onChange={e => { setTargetValue(e.target.value); setAlertSet(false); }}
            className="flex-1 px-4 py-3 rounded-xl outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: `1px solid ${atTarget ? 'var(--positive)' : 'var(--border)'}`,
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={() => setAlertSet(true)}
            className="px-5 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Set
          </button>
        </div>
        {alertSet && targetValue && (
          <div
            className="mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor: atTarget ? 'rgba(34,197,94,0.1)' : 'rgba(56,189,248,0.1)',
              color: atTarget ? 'var(--positive)' : 'var(--accent)',
              border: `1px solid ${atTarget ? 'rgba(34,197,94,0.2)' : 'rgba(56,189,248,0.2)'}`,
            }}
          >
            <Bell size={14} />
            {atTarget
              ? `✅ Target reached! Current rate (${rate?.toFixed(4)}) ≥ ${targetValue}`
              : `Watching: current rate (${rate?.toFixed(4)}) is below your target of ${targetValue}`}
          </div>
        )}
      </div>

      {/* Historical chart */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Historical Rate
          </h2>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: days === d ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: days === d ? 'white' : 'var(--text-secondary)',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {history.length > 0 ? (
          <LineChartComponent data={history} dataKey="rate" label={`1 ${mainCurrency} in ${targetCurrency}`} />
        ) : (
          <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            {loading ? 'Loading chart…' : 'No data available'}
          </div>
        )}
      </div>
    </div>
  );
}
