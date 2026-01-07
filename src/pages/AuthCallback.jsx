import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      try {
        const type = searchParams.get('type');

        // Handle password recovery
        if (type === 'recovery') {
          setStatus('success');
          setMessage('Redirecting to reset your password...');
          setTimeout(() => {
            window.location.href = '/dashboard/settings?tab=security&reset=true';
          }, 1500);
          return;
        }

        // Check for hash with tokens
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set session and redirect using window.location (not React Router)
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (mounted) {
              setStatus('success');
              setMessage('Successfully signed in! Redirecting...');
              // Use hard redirect to ensure clean state
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 1000);
            }
            return;
          }
        }

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
          return;
        }

        // No session found
        if (mounted) {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
        }
      } catch (error) {
        if (mounted) {
          setStatus('error');
          setMessage(error.message || 'Authentication failed.');
        }
      }
    };

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 md:p-8 text-center max-w-sm w-full"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-charcoal mb-2">Signing you in...</h1>
            <p className="text-slate-500 text-sm">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">Success!</h1>
            <p className="text-slate-500 text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">Authentication Failed</h1>
            <p className="text-slate-500 text-sm mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
