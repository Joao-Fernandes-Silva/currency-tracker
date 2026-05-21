import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
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
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [latest] = await Promise.all([
          getLatestRates(mainCurrency),
        ]);
        setLastUpdated(latest.date);

        // Build rows — get 7-day change per currency would require too many calls,
        // so we show current rate and fetch change for visible rows lazily
        const result: CurrencyRow[] = Object.entries(latest.rates)
          .filter(([code]) => code !== mainCurrency)
          .map(([code, rate]) => ({
            code,
            name: SUPPORTED_CURRENCIES[code] || code,
            rate,
            change: null,
          }));

        setRows(result);

        // Fetch 7-day history for each concurrently (Frankfurter allows it)
        const weekAgoDate = new Date();
        weekAgoDate.setDate(weekAgoDate.getDate() - 7);
        const weekAgoStr = weekAgoDate.toISOString().split('T')[0];

        const { data: weekData } = await axios.get(`https://api.frankfurter.app/${weekAgoStr}?from=${mainCurrency}`);

        setRows(prev =>
          prev.map(row => {
            const oldRate = weekData.rates[row.code];
            if (!oldRate) return row;
            const change = ((row.rate - oldRate) / oldRate) * 100;
            return { ...row, change };
          })
        );
      } catch (e) {
        console.error(e);
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
    <div className="flex-1 px-4 md:px-8 py-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            All Currencies
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Rates against {mainCurrency} · {lastUpdated || 'Loading…'}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search currency…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(row => (
            <button
              key={row.code}
              onClick={() => navigate(`/currencies/${row.code}`)}
              className="text-left p-5 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CURRENCY_FLAGS[row.code] || '🏳️'}</span>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{row.code}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.name}</p>
                  </div>
                </div>
                {row.change !== null && (
                  <div
                    className="flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: row.change >= 0 ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: row.change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {row.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(row.change).toFixed(2)}%
                  </div>
                )}
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                1 {mainCurrency} = {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {row.code}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
