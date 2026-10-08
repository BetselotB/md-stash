import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
import { seedInitialDataIfNeeded } from './db/seed';

// Seed initial starter files if IndexedDB is freshly created
seedInitialDataIfNeeded().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
