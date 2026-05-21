import { Link } from 'react-router-dom';
import { TrendingUp, Repeat, BarChart2, Bitcoin, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Repeat size={24} />,
    title: 'Currency Tracker',
    description: 'Live conversion between any two currencies with a price-target alert and historical charts.',
    to: '/tracker',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'All Currencies',
    description: 'Browse all 30+ fiat currencies, see 7-day performance and dive into detailed rate charts.',
    to: '/currencies',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.1)',
  },
  {
    icon: <Bitcoin size={24} />,
    title: 'Crypto Markets',
    description: 'Follow the top 50 cryptocurrencies with live prices, sparklines and market-cap data.',
    to: '/crypto',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
  },
];

const stats = [
  { value: '30+', label: 'Fiat Currencies' },
  { value: '50', label: 'Crypto Assets' },
  { value: 'ECB', label: 'Data Source' },
  { value: 'Daily', label: 'Updates' },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 max-w-6xl mx-auto w-full">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider"
          style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--accent)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <TrendingUp size={12} />
          Live rates · Updated daily via ECB
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-none tracking-tight">
          <span style={{ color: 'var(--text-primary)' }}>Track currencies</span>
          <br />
          <span className="gradient-text">&amp; crypto</span>
          <span style={{ color: 'var(--text-primary)' }}> in one place</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Monitor exchange rates, set price targets, and explore detailed historical charts — clean, minimal, and fast.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/tracker"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: 'var(--gradient)' }}
          >
            Start Tracking <ArrowRight size={16} />
          </Link>
          <Link
            to="/currencies"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            Browse Currencies
          </Link>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section className="px-6 pb-12 max-w-6xl mx-auto w-full">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          {stats.map(s => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-6 px-4"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Everything you need</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Three tools, one clean interface.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(f => (
            <Link
              key={f.to}
              to={f.to}
              className="group p-6 rounded-2xl flex flex-col gap-5 transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: f.color }}>
                Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
