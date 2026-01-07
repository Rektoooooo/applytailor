import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabase } from './lib/supabase'

// Handle OAuth hash BEFORE React renders
const hash = window.location.hash;
const isOAuthCallback = hash && hash.includes('access_token') && window.location.pathname === '/auth/callback';

if (isOAuthCallback) {
  // Show loading state
  document.getElementById('root').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#faf9f7">
      <div style="text-align:center">
        <div style="margin-bottom:16px;color:#1e293b">Signing you in...</div>
      </div>
    </div>
  `;

  // Parse tokens
  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    // Get Supabase project ref from URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1] || 'unknown';

    // Parse the JWT to get user info
    const tokenParts = accessToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));

    // Store in Supabase's expected localStorage format
    const storageKey = `sb-${projectRef}-auth-token`;
    const expiresAt = params.get('expires_at');

    const sessionData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: parseInt(expiresAt),
      expires_in: parseInt(params.get('expires_in') || '3600'),
      token_type: 'bearer',
      user: {
        id: payload.sub,
        email: payload.email,
        app_metadata: payload.app_metadata,
        user_metadata: payload.user_metadata,
        aud: payload.aud,
        role: payload.role,
      }
    };

    localStorage.setItem(storageKey, JSON.stringify(sessionData));

    // Also set session on Supabase client (with timeout)
    const setSessionTimeout = setTimeout(() => {
      window.location.replace('/');
    }, 2000);

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(() => {
      clearTimeout(setSessionTimeout);
      window.location.replace('/');
    }).catch(() => {
      clearTimeout(setSessionTimeout);
      window.location.replace('/');
    });
  } else {
    window.location.replace('/login?error=missing_tokens');
  }
} else {
  // Normal app render
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
