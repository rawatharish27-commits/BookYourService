import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
// ============================================

// 1. Mount App
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
