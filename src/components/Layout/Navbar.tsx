import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
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
        }}
        className="sticky top-0 z-40 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <TrendingUp size={24} />
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CurrencyTrack
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors"
                style={{
                  color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Burger button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1.5 p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open menu"
          >
            <span
              className="block w-5 h-0.5 rounded transition-all"
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            <span
              className="block w-5 h-0.5 rounded transition-all"
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            <span
              className="block w-3.5 h-0.5 rounded transition-all"
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
          </button>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-4 pb-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium"
              style={{
                color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
