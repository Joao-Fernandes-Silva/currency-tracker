import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../types';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  mainCurrency: string;
  setMainCurrency: (currency: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  const [mainCurrency, setMainCurrencyState] = useState<string>(() => {
    return localStorage.getItem('mainCurrency') || 'USD';
  });

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mainCurrency', mainCurrency);
  }, [mainCurrency]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const setMainCurrency = (currency: string) => setMainCurrencyState(currency);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, mainCurrency, setMainCurrency }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
