

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import './i18n';
import { HelmetProvider } from 'react-helmet-async'; // Adiciona isto se faltar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Substitui o Client ID pelo teu que criaste no Google Console */}
    <GoogleOAuthProvider clientId="925230978662-dh81pj9ktrsp5q706uk0ks4214eql1kh.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);