import { Link } from 'react-router-dom';
import { TrendingUp, Repeat, BarChart2, Bitcoin, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/Layout/PageWrapper';

const features = [
  {
    icon: <Repeat size={26} />,
    title: 'Currency Tracker',
    description:
      'Live conversion between any two currencies. Set a price target and track rate history over 7 days, 1 month, or longer.',
    to: '/tracker',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  {
    icon: <BarChart2 size={26} />,
    title: 'All Currencies',
    description:
      'Browse all 30+ fiat currencies with real-time rates and 7-day performance. Click any currency for detailed charts.',
    to: '/currencies',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
  },
  {
    icon: <Bitcoin size={26} />,
    title: 'Crypto Markets',
    description:
      'Follow the top 50 cryptocurrencies — live prices, 24h/7d change, market caps and 7-day sparkline charts.',
    to: '/crypto',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
  },
];

const stats = [
  { value: '30+', label: 'Fiat Currencies' },
  { value: '50', label: 'Crypto Assets' },
  { value: 'ECB', label: 'Data Source' },
  { value: 'Daily', label: 'Rate Updates' },
];

export default function Home() {
  return (
    <PageWrapper maxWidth="1200px">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '72px' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(139,92,246,0.12)',
            color: 'var(--accent)',
            border: '1px solid rgba(139,92,246,0.25)',
            marginBottom: '32px',
          }}
        >
          <TrendingUp size={12} />
          Live rates · Updated daily via ECB
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '28px',
            color: 'var(--text-primary)',
          }}
        >
          Track currencies
          <br />
          <span className="gradient-text">&amp; crypto</span> in one place
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto 44px',
            color: 'var(--text-secondary)',
          }}
        >
          Monitor exchange rates, set price targets, and explore detailed historical
          charts — all in a clean, minimal interface.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/tracker"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'white',
              background: 'var(--gradient)',
              textDecoration: 'none',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Start Tracking <ArrowRight size={16} />
          </Link>
          <Link
            to="/currencies"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Browse Currencies
          </Link>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: '80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '28px 20px',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <p className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                {s.value}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  marginTop: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '12px',
              color: 'var(--text-primary)',
            }}
          >
            Everything you need
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Three tools, one clean interface.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map(f => (
            <Link
              key={f.to}
              to={f.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '32px',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = f.color + '55';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: f.bg,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {f.description}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: f.color,
                }}
              >
                Explore <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
