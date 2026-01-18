import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// ============================================
// MAIN ENTRY POINT (REACT 18+)
// ============================================
// Purpose: Mount React App to DOM.
// Stack: React 18 + ReactDOM.
// Type: Production-Grade (Strict).
// 
// IMPORTANT:
// 1. Imports `App` (Root Component - BrowserRouter + Routes).
// 2. Mounts to `#root` element in `index.html`.
// 3. Wraps App in ErrorBoundary for crash protection.
// ============================================

const FallbackUI = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
    <div>
      <h2>Something went wrong.</h2>
      <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
    </div>
  </div>
);

// 1. Mount App
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={FallbackUI}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
