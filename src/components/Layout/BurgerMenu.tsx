import { useEffect } from 'react';
import { X, Sun, Moon, DollarSign } from 'lucide-react';
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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full w-80 z-50 flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
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
              className="w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <span className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </span>
              <div
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ transform: theme === 'dark' ? 'translateX(22px)' : 'translateX(4px)' }}
                />
              </div>
            </button>
          </section>

          {/* Main currency */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <DollarSign size={12} /> Base Currency
              </span>
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              All conversions will use this as your base currency.
            </p>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setMainCurrency(code)}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
                  style={{
                    backgroundColor: mainCurrency === code ? 'var(--accent)' : 'transparent',
                    color: mainCurrency === code ? 'white' : 'var(--text-primary)',
                  }}
                >
                  <span className="text-xl">{CURRENCY_FLAGS[code]}</span>
                  <div>
                    <span className="font-semibold text-sm">{code}</span>
                    <span className="text-xs block" style={{ opacity: 0.7 }}>{name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
