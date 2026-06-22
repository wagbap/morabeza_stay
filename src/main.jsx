

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import './utils/polyfills.js';
import './i18n';
import { HelmetProvider } from 'react-helmet-async'; // Adiciona isto se faltar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Substitui o Client ID pelo teu que criaste no Google Console */}
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);