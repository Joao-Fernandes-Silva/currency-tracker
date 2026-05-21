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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
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
            style={{
              padding: '20px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border)',
            }}
          >
            Data: Frankfurter API (ECB) · CoinGecko · Updated daily
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
