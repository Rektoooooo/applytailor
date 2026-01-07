import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Landing from '../pages/Landing';

/**
 * Smart root component that shows:
 * - Landing page if not authenticated
 * - Redirects to /dashboard if authenticated
 */
export default function RootRedirect() {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Show loading spinner while checking auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show landing page
  return <Landing />;
}
