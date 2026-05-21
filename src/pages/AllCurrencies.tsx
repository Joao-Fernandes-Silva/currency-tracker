import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { getLatestRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';

interface CurrencyRow {
  code: string;
  name: string;
  rate: number;
  change: number | null;
}

export default function AllCurrencies() {
  const { mainCurrency } = useApp();
  const navigate = useNavigate();
  const [rows, setRows] = useState<CurrencyRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const latest = await getLatestRates(mainCurrency);
        setLastUpdated(latest.date);

        const result: CurrencyRow[] = Object.entries(latest.rates)
          .map(([code, rate]) => ({
            code,
            name: SUPPORTED_CURRENCIES[code] || code,
            rate: rate as number,
            change: null,
          }));

        setRows(result);

        // Fetch 7-day-ago rates for % change
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const { data: weekData } = await axios.get(
          `https://api.frankfurter.app/${weekAgoStr}?from=${mainCurrency}`
        );

        setRows(prev =>
          prev.map(row => {
            const oldRate = weekData.rates?.[row.code];
            if (!oldRate) return row;
            const change = ((row.rate - oldRate) / oldRate) * 100;
            return { ...row, change };
          })
        );
      } catch (e) {
        console.error(e);
        setError('Failed to load currency data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [mainCurrency]);

  const filtered = rows.filter(
    r =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 px-4 py-10 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1 gradient-text">All Currencies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Live rates vs <strong style={{ color: 'var(--text-primary)' }}>{mainCurrency}</strong>
            {lastUpdated && <span> · {lastUpdated}</span>}
          </p>
        </div>

        {/* Search — flex wrapper so icon never overlaps text */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full md:w-72"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search currency…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Search size={32} style={{ color: 'var(--text-secondary)' }} className="mb-3" />
          <p style={{ color: 'var(--text-secondary)' }}>No currencies match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(row => (
            <button
              key={row.code}
              onClick={() => navigate(`/currencies/${row.code}`)}
              className="group text-left p-5 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Top row: flag + code + badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CURRENCY_FLAGS[row.code] || '🏳️'}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{row.code}</p>
                    <p className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>{row.name}</p>
                  </div>
                </div>

                {row.change !== null ? (
                  <div
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      color: row.change >= 0 ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: row.change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {row.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {Math.abs(row.change).toFixed(2)}%
                  </div>
                ) : (
                  <div className="w-16 h-5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                )}
              </div>

              {/* Rate */}
              <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
                {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  1 {mainCurrency} = {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {row.code}
                </p>
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent)' }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
