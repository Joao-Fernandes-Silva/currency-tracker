import { useState, useRef, useEffect } from 'react';
import { X, Sun, Moon, Search, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../../services/frankfurterApi';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const { theme, toggleTheme, mainCurrency, setMainCurrency } = useApp();
  const [currencySearch, setCurrencySearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset search when menu closes
  useEffect(() => {
    if (!isOpen) { setCurrencySearch(''); setDropdownOpen(false); }
  }, [isOpen]);

  const filteredCurrencies = Object.entries(SUPPORTED_CURRENCIES).filter(
    ([code, name]) =>
      code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible click-away area — does NOT dim the page */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 48,
          background: 'transparent',
        }}
      />

      {/* Slide-in panel */}
      <aside
        style={{
          position: 'fixed',
          top: '72px',       /* sits right below the navbar */
          right: 0,
          width: '320px',
          height: 'calc(100vh - 72px)',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.4)',
          animation: 'slideIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Settings</span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* ── Theme toggle ───────────────────────────────────── */}
          <section>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Appearance
            </p>
            <button
              onClick={toggleTheme}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                {theme === 'dark' ? <Moon size={16} style={{ color: 'var(--accent)' }} /> : <Sun size={16} style={{ color: 'var(--accent)' }} />}
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              {/* Pill toggle */}
              <div style={{
                position: 'relative', width: '42px', height: '22px', borderRadius: '999px',
                backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)',
                transition: 'background-color 0.3s',
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transform: theme === 'dark' ? 'translateX(23px)' : 'translateX(3px)',
                  transition: 'transform 0.3s',
                }} />
              </div>
            </button>
          </section>

          {/* ── Base currency ──────────────────────────────────── */}
          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Base Currency
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              All conversions use this as the base.
            </p>

            {/* Currently selected */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: '12px', marginBottom: '12px',
              background: 'var(--gradient)',
            }}>
              <span style={{ fontSize: '22px' }}>{CURRENCY_FLAGS[mainCurrency]}</span>
              <div>
                <p style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>{mainCurrency}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{SUPPORTED_CURRENCIES[mainCurrency]}</p>
              </div>
              <Check size={16} color="white" style={{ marginLeft: 'auto' }} />
            </div>

            {/* Searchable dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Search input */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px', borderRadius: '12px',
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                  cursor: 'text',
                }}
                onClick={() => setDropdownOpen(true)}
              >
                <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search or select currency…"
                  value={currencySearch}
                  onChange={e => { setCurrencySearch(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '13px', color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                  maxHeight: '280px', overflowY: 'auto', zIndex: 99,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  {filteredCurrencies.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      No currencies found
                    </div>
                  ) : (
                    filteredCurrencies.map(([code, name]) => {
                      const selected = mainCurrency === code;
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setMainCurrency(code);
                            setCurrencySearch('');
                            setDropdownOpen(false);
                          }}
                          style={{
                            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                            gap: '10px', padding: '10px 14px', cursor: 'pointer', border: 'none',
                            backgroundColor: selected ? 'rgba(139,92,246,0.12)' : 'transparent',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)';
                          }}
                          onMouseLeave={e => {
                            if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }}
                        >
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>{CURRENCY_FLAGS[code]}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                              {code}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{name}</span>
                          </div>
                          {selected && <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
