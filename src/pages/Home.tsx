import { Link } from 'react-router-dom';
import { TrendingUp, Repeat, BarChart2, Bitcoin } from 'lucide-react';

const features = [
  {
    icon: <Repeat size={28} />,
    title: 'Currency Tracker',
    description: 'Track real-time exchange rates and set your target buy/sell price for any currency pair.',
    to: '/tracker',
    color: '#38bdf8',
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'All Currencies',
    description: 'Browse all available currencies, see their performance, and dive into detailed charts.',
    to: '/currencies',
    color: '#a78bfa',
  },
  {
    icon: <Bitcoin size={28} />,
    title: 'Crypto Markets',
    description: 'Follow the top cryptocurrencies, track price movements and market capitalisation.',
    to: '/crypto',
    color: '#fb923c',
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6"
          style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          <TrendingUp size={14} />
          Live exchange rates · Updated daily
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Track currencies &<br />
          <span style={{ color: 'var(--accent)' }}>crypto</span> in one place
        </h1>
        <p className="text-lg max-w-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
          Monitor exchange rates, set price targets, and explore detailed historical charts — all in a clean, minimal interface.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/tracker"
            className="px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Start Tracking
          </Link>
          <Link
            to="/currencies"
            className="px-6 py-3 rounded-xl font-semibold transition-colors"
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

      {/* Features */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-2xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>
          Everything you need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <Link
              key={f.to}
              to={f.to}
              className="group p-6 rounded-2xl flex flex-col gap-4 transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${f.color}18`, color: f.color }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.description}
                </p>
              </div>
              <span className="text-sm font-medium mt-auto" style={{ color: f.color }}>
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
