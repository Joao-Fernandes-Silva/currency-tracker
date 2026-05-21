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
      <nav
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient)' }}
            >
              <TrendingUp size={16} color="white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CurrencyTrack
            </span>
          </Link>

          {/* Nav links — center */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: active ? 'white' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Burger menu button — always on the right */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Open settings"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Mobile nav links */}
        <div
          className="md:hidden flex gap-1 px-6 pb-3"
        >
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? 'white' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--accent)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
