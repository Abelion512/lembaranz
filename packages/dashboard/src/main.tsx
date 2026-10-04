/**
 * Web entry point.
 *
 * Owns the hash router, which resolves to either the marketing landing page or
 * the vault. The vault is imported with `lazy` behind a `Suspense` fallback on
 * purpose: a static import made every marketing visitor download Argon2id, the
 * storage adapters, and the confetti bundle. Splitting it cut initial JS from
 * 355.87 kB to 282.27 kB.
 */
import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing.tsx';
import './index.css';
import './i18n';

// Vault UI pulls in Argon2id, the storage adapters, and confetti. Landing
// visitors never open a vault, so keep it out of the initial bundle.
const App = lazy(() => import('./App.tsx'));

function getPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function Root() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: string) => {
    window.history.pushState({}, '', next);
    setPath(getPath());
    window.scrollTo(0, 0);
  }, []);

  // ponytail: path-based routing in one Root component, upgrade path: react-router when routes grow
  if (path.startsWith('/app')) {
    return (
      <Suspense
        fallback={
          <div className="hero-field min-h-screen flex items-center justify-center text-muted">
            <span className="fade-up text-sm">Opening vault...</span>
          </div>
        }
      >
        <App />
      </Suspense>
    );
  }
  return <Landing onEnter={() => navigate('/app')} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
