import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { getLatestRates, SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../services/frankfurterApi';
import PageWrapper from '../components/Layout/PageWrapper';

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

        const result: CurrencyRow[] = Object.entries(latest.rates).map(([code, rate]) => ({
          code,
          name: SUPPORTED_CURRENCIES[code] || code,
          rate: rate as number,
          change: null,
        }));

        setRows(result);

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
            return { ...row, change: ((row.rate - oldRate) / oldRate) * 100 };
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
    <PageWrapper maxWidth="1100px">

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
            All Currencies
          </h1>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', opacity: 0.75, marginTop: '4px' }}>
            Live rates vs <strong style={{ color: 'var(--text-primary)', opacity: 1 }}>{mainCurrency}</strong>
            {lastUpdated && <span> · {lastUpdated}</span>}
          </p>
        </div>

        {/* Search — icon sits inside the box, never overlapping text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            minWidth: '260px',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search currency…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '28px',
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

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '120px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-card)',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            gap: '12px',
          }}
        >
          <Search size={36} />
          <p>No currencies match "{search}"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map(row => (
            <button
              key={row.code}
              onClick={() => navigate(`/currencies/${row.code}`)}
              style={{
                textAlign: 'left',
                padding: '24px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{CURRENCY_FLAGS[row.code] || '🏳️'}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{row.code}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{row.name}</p>
                  </div>
                </div>

                {row.change !== null ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: row.change >= 0 ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: row.change >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {row.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {Math.abs(row.change).toFixed(2)}%
                  </div>
                ) : (
                  <div style={{ width: '60px', height: '22px', borderRadius: '999px', backgroundColor: 'var(--bg-secondary)' }} />
                )}
              </div>

              {/* Rate */}
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px' }}>
                {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  1 {mainCurrency} = {row.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {row.code}
                </p>
                <ArrowRight size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
