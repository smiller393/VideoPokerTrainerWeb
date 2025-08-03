import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from './services/pwa';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

registerSW();