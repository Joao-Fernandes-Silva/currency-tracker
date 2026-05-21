import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import CurrencyTracker from './pages/CurrencyTracker';
import AllCurrencies from './pages/AllCurrencies';
import CurrencyDetail from './pages/CurrencyDetail';
import Crypto from './pages/Crypto';
import CryptoDetail from './pages/CryptoDetail';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tracker" element={<CurrencyTracker />} />
              <Route path="/currencies" element={<AllCurrencies />} />
              <Route path="/currencies/:code" element={<CurrencyDetail />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/crypto/:id" element={<CryptoDetail />} />
            </Routes>
          </main>
          <footer
            className="py-4 text-center text-xs"
            style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}
          >
            Data: Frankfurter API (ECB) · CoinGecko · Updated daily
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
