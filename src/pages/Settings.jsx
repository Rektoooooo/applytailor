import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User,
  Coins,
  Shield,
  Database,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  LogOut,
  Trash2,
  Download,
  Sparkles,
  Plus,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase, signOut, updatePassword, verifyCurrentPassword, getPurchaseHistory } from '../lib/supabase';

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'credits', label: 'Credits', icon: Coins },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-48 flex-shrink-0"
          >
            <nav className="card p-2 flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-visible md:sticky md:top-24 scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-600 hover:bg-warm-gray hover:text-charcoal'
                  }`}
                >
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && <AccountTab key="account" />}
              {activeTab === 'credits' && <CreditsTab key="credits" />}
              {activeTab === 'security' && <SecurityTab key="security" />}
              {activeTab === 'data' && <DataTab key="data" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: fullName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-6">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const INITIAL_FREE_CREDITS = 1;

function CreditsTab() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  const credits = profile?.credits || 0;
  const totalPurchased = profile?.total_credits_purchased || 0;
  const totalReceived = totalPurchased + INITIAL_FREE_CREDITS;
  const creditsUsed = totalReceived - credits;

  useEffect(() => {
    async function fetchPurchases() {
      if (!user?.id) return;
      const { data } = await getPurchaseHistory(user.id);
      setPurchases(data || []);
      setLoadingPurchases(false);
    }
    fetchPurchases();
  }, [user?.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (cents, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Credits Balance */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-charcoal mb-1">Credits Balance</h2>
            <p className="text-sm text-slate-500">Use credits to generate tailored CVs</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Balance Display */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-charcoal mb-2">{credits}</div>
            <p className="text-slate-500">credits available</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-charcoal">{totalReceived}</div>
            <p className="text-xs text-slate-500">Total received</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-charcoal">{creditsUsed}</div>
            <p className="text-xs text-slate-500">Used</p>
          </div>
        </div>

        {/* Top Up Button */}
        <button
          onClick={() => navigate('/dashboard/topup')}
          className="btn-primary w-full"
        >
          <Plus className="w-4 h-4" />
          Top Up Credits
        </button>
      </div>

      {/* How Credits Work */}
      <div className="card p-6 bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-charcoal">How Credits Work</h3>
        </div>
        <ul className="space-y-3">
          {[
            { text: '1 credit = 1 tailored CV generation', highlight: true },
            { text: 'Credits never expire', highlight: false },
            { text: 'Buy more anytime, credits stack', highlight: false },
            { text: 'New users get 1 free credit', highlight: false },
          ].map((item, i) => (
            <li key={i} className={`flex items-center gap-2 text-sm ${item.highlight ? 'font-medium text-teal-700' : 'text-slate-600'}`}>
              <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Purchase History */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-charcoal">Purchase History</h3>
        </div>

        {loadingPurchases ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No purchases yet</p>
            <button
              onClick={() => navigate('/dashboard/topup')}
              className="text-sm text-teal-600 hover:text-teal-700 mt-2"
            >
              Buy your first credits
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {purchase.package_name} Package
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(purchase.purchased_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">
                    +{purchase.credits_purchased} credits
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatAmount(purchase.amount_cents, purchase.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Credits Warning */}
      {credits <= 2 && credits > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Running low on credits</p>
              <p className="text-sm text-amber-600 mt-1">
                You have {credits} credit{credits !== 1 ? 's' : ''} remaining. Top up to continue creating tailored CVs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Credits Warning */}
      {credits === 0 && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">No credits remaining</p>
              <p className="text-sm text-red-600 mt-1">
                You need credits to generate tailored CVs. Top up now to continue.
              </p>
              <button
                onClick={() => navigate('/dashboard/topup')}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1"
              >
                Get more credits
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SecurityTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user signed in with OAuth (Google, etc.) - they might not have a password
  const isOAuthUser = user?.app_metadata?.provider !== 'email';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    // For non-OAuth users, verify current password first
    if (!isOAuthUser) {
      if (!currentPassword) {
        setError('Please enter your current password');
        return;
      }

      const { success: isValid, error: verifyError } = await verifyCurrentPassword(user.email, currentPassword);
      if (!isValid) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/landing';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Change Password */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-2">
          {isOAuthUser ? 'Set Password' : 'Change Password'}
        </h2>
        {isOAuthUser && (
          <p className="text-sm text-slate-500 mb-6">
            You signed in with Google. Set a password to also sign in with email.
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-emerald-600">Password updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password - only for email users */}
          {!isOAuthUser && (
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="input-field"
                required
              />
            </div>
          )}

          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isOAuthUser ? 'Set Password' : 'Update Password')}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-2">Sign Out</h2>
        <p className="text-sm text-slate-500 mb-4">Sign out of your account on this device</p>
        <button onClick={handleSignOut} className="btn-secondary text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}

function DataTab() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);

    try {
      // Fetch base profile
      const { data: baseProfile } = await supabase
        .from('base_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch all applications
      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);

      // Create export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        account: {
          email: user.email,
          fullName: profile?.full_name,
          createdAt: user.created_at,
        },
        baseProfile: baseProfile || null,
        applications: applications || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applytailor-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete !== 'DELETE' || !user) return;
    setDeleting(true);

    try {
      // Delete all applications
      await supabase
        .from('applications')
        .delete()
        .eq('user_id', user.id);

      // Delete base profile
      await supabase
        .from('base_profiles')
        .delete()
        .eq('user_id', user.id);

      // Delete user profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // Sign out
      await signOut();

      toast.success('Account deleted successfully');
      navigate('/landing');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Export Data */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-charcoal mb-2">Export Your Data</h2>
        <p className="text-sm text-slate-500 mb-4">
          Download all your profile data, applications, and generated content.
        </p>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary">
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Delete Account */}
      <div className="card p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h2>
        <p className="text-sm text-slate-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <div className="p-4 bg-red-50 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Warning</p>
              <p className="text-sm text-red-600 mt-1">
                This will permanently delete your account, profile, all applications, and
                cancel any active subscription. Type DELETE to confirm.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="input-field"
          />
          <button
            onClick={handleDelete}
            disabled={confirmDelete !== 'DELETE' || deleting}
            className="btn-secondary text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
