import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Menu } from 'lucide-react';
import BurgerMenu from './BurgerMenu';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/currencies', label: 'Currencies' },
  { to: '/crypto', label: 'Crypto' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          height: '72px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}>

          {/* Logo — left */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--gradient)',
            }}>
              <TrendingUp size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              CurrencyTrack
            </span>
          </Link>

          {/* Nav links — truly centered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: active ? 'white' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--accent)' : 'transparent',
                    transition: 'all 0.2s',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)';
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Burger — right, pushed to the far right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer',
                backgroundColor: menuOpen ? 'var(--accent)' : 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: menuOpen ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              aria-label="Toggle settings"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
