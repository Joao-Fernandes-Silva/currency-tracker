import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { getCryptoDetail, getCryptoHistory } from '../services/coinGeckoApi';
import LineChartComponent from '../components/Charts/LineChartComponent';

const PERIODS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
];

export default function CryptoDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any>(null);
  const [history, setHistory] = useState<{ date: string; price: number }[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCryptoDetail(id).then(setDetail).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setChartLoading(true);
    getCryptoHistory(id, 'usd', period)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [id, period]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        Loading…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        Coin not found.
      </div>
    );
  }

  const price = detail.market_data?.current_price?.usd;
  const change24h = detail.market_data?.price_change_percentage_24h_in_currency?.usd;
  const change7d = detail.market_data?.price_change_percentage_7d_in_currency?.usd;
  const change30d = detail.market_data?.price_change_percentage_30d_in_currency?.usd;
  const ath = detail.market_data?.ath?.usd;
  const minPrice = history.length ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length ? Math.max(...history.map(h => h.price)) : 0;

  return (
    <div className="flex-1 px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
      <Link
        to="/crypto"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={16} /> Back to Crypto
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <img src={detail.image?.large} alt={detail.name} className="w-14 h-14 rounded-full" />
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {detail.name}
          </h1>
          <p className="uppercase text-sm" style={{ color: 'var(--text-secondary)' }}>{detail.symbol}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
            ${price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
          {change24h !== undefined && (
            <p
              className="text-sm font-medium flex items-center gap-1 justify-end mt-1"
              style={{ color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)' }}
            >
              {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {change24h >= 0 ? '+' : ''}{change24h?.toFixed(2)}% (24h)
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '24h Change', value: `${change24h >= 0 ? '+' : ''}${change24h?.toFixed(2)}%`, color: change24h >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: '7d Change', value: `${change7d >= 0 ? '+' : ''}${change7d?.toFixed(2)}%`, color: change7d >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: '30d Change', value: `${change30d >= 0 ? '+' : ''}${change30d?.toFixed(2)}%`, color: change30d >= 0 ? 'var(--positive)' : 'var(--negative)' },
          { label: 'All-Time High', value: `$${ath?.toLocaleString(undefined, { maximumFractionDigits: 4 })}`, color: 'var(--text-primary)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Price History (USD)</h2>
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

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
            Loading chart…
          </div>
        ) : (
          <LineChartComponent data={history} dataKey="price" color="#fb923c" />
        )}
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Period High</p>
          <p className="text-xl font-bold" style={{ color: 'var(--positive)' }}>
            ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Period Low</p>
          <p className="text-xl font-bold" style={{ color: 'var(--negative)' }}>
            ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
      </div>

      {/* Description */}
      {detail.description?.en && (
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>About {detail.name}</h2>
          <p
            className="text-sm leading-relaxed line-clamp-6"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{
              __html: detail.description.en.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, ''),
            }}
          />
        </div>
      )}
    </div>
  );
}
