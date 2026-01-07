import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RootRedirect from './components/RootRedirect';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Protected pages
import Dashboard from './pages/Dashboard';
import BaseProfile from './pages/BaseProfile';
import NewApplication from './pages/NewApplication';
import Results from './pages/Results';
import Settings from './pages/Settings';
import CVTemplates from './pages/CVTemplates';
import TopUp from './pages/TopUp';
import SmartReply from './pages/SmartReply';
import SmartReplyNew from './pages/SmartReplyNew';
import SmartReplyConversation from './pages/SmartReplyConversation';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Root - shows Landing or redirects to Dashboard based on auth */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected routes - under /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<BaseProfile />} />
            <Route path="new" element={<NewApplication />} />
            <Route path="results" element={<Results />} />
            <Route path="results/:id" element={<Results />} />
            <Route path="templates" element={<CVTemplates />} />
            <Route path="settings" element={<Settings />} />
            <Route path="topup" element={<TopUp />} />
          </Route>

          {/* Smart Reply routes - protected, with sidebar layout */}
          <Route
            path="/smart-reply"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SmartReply />} />
            <Route path="new" element={<SmartReplyNew />} />
            <Route path=":id" element={<SmartReplyConversation />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
