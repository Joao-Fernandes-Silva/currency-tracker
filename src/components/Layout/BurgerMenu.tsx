import { useEffect } from 'react';
import { X, Sun, Moon, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES, CURRENCY_FLAGS } from '../../services/frankfurterApi';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const { theme, toggleTheme, mainCurrency, setMainCurrency } = useApp();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* Theme toggle */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              Appearance
            </p>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <span className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark'
                  ? <Moon size={16} style={{ color: 'var(--accent)' }} />
                  : <Sun size={16} style={{ color: 'var(--accent)' }} />}
                <span className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
              {/* Toggle pill */}
              <div
                className="relative w-10 h-5 rounded-full transition-colors duration-300"
                style={{ backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                  style={{ transform: theme === 'dark' ? 'translateX(21px)' : 'translateX(2px)' }}
                />
              </div>
            </button>
          </section>

          {/* Main currency */}
          <section className="flex-1 flex flex-col min-h-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Base Currency
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              All conversions will use this currency as the base.
            </p>

            {/* Currently selected */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
              style={{ background: 'var(--gradient)', opacity: 0.9 }}
            >
              <span className="text-2xl">{CURRENCY_FLAGS[mainCurrency]}</span>
              <div>
                <p className="font-bold text-white text-sm">{mainCurrency}</p>
                <p className="text-xs text-white/70">{SUPPORTED_CURRENCIES[mainCurrency]}</p>
              </div>
              <Coins size={16} className="ml-auto text-white/70" />
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-0.5">
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, name]) => {
                const selected = mainCurrency === code;
                return (
                  <button
                    key={code}
                    onClick={() => setMainCurrency(code)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: selected ? 'rgba(139,92,246,0.15)' : 'transparent',
                      border: selected ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                      color: selected ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    <span className="text-lg">{CURRENCY_FLAGS[code]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{code}</span>
                      <span className="text-xs block truncate" style={{ color: selected ? 'var(--accent)' : 'var(--text-secondary)', opacity: 0.8 }}>{name}</span>
                    </div>
                    {selected && (
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
