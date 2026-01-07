import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, ArrowLeft, Loader2, Zap, Sparkles, Crown, Coins } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { CREDIT_PACKAGES } from '../lib/stripe';

export default function TopUp() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { startCheckout } = useSubscription();
  const [loading, setLoading] = useState(null);

  const currentCredits = profile?.credits || 0;

  const handlePurchase = async (packageKey) => {
    const pkg = CREDIT_PACKAGES[packageKey];
    if (!pkg?.priceId) {
      toast.error('Payment system not configured. Please try again later.');
      return;
    }

    setLoading(packageKey);
    try {
      await startCheckout(pkg.priceId);
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    }
    setLoading(null);
  };

  const packages = [
    {
      key: 'starter',
      name: 'Starter',
      credits: 25,
      price: 3,
      pricePerCV: '0.12',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      key: 'standard',
      name: 'Standard',
      credits: 75,
      price: 7,
      pricePerCV: '0.09',
      icon: Sparkles,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      key: 'pro',
      name: 'Pro',
      credits: 150,
      price: 12,
      pricePerCV: '0.08',
      icon: Crown,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Top Up Credits"
        subtitle="Purchase credits to generate more tailored CVs"
      />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button & Current Balance */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
              <Coins className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-slate-600">Current balance:</span>
              <span className="font-bold text-charcoal">{currentCredits} credits</span>
            </div>
          </motion.div>

          {/* Credit Packages */}
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-6 relative ${
                  pkg.popular ? 'border-2 border-teal-500 shadow-lg' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                      Best Value
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center mb-4`}>
                  <pkg.icon className="w-6 h-6 text-white" />
                </div>

                {/* Package Info */}
                <h3 className="text-xl font-bold text-charcoal mb-1">{pkg.name}</h3>
                <p className="text-slate-500 mb-4">{pkg.credits} credits</p>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-charcoal">${pkg.price}</span>
                  <div className="text-sm text-teal-600 mt-1">
                    ${pkg.pricePerCV} per CV
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-teal-500" />
                    {pkg.credits} CV generations
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-teal-500" />
                    Never expires
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-teal-500" />
                    All templates included
                  </li>
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg.key)}
                  disabled={loading === pkg.key}
                  className={`w-full ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {loading === pkg.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Buy ${pkg.credits} Credits`
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 card p-6 bg-slate-50"
          >
            <h3 className="font-semibold text-charcoal mb-4">How it works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-teal-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal">Choose a package</p>
                  <p className="text-sm text-slate-500">Select the credit amount that fits your needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-teal-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal">Secure checkout</p>
                  <p className="text-sm text-slate-500">Pay securely with Stripe</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-teal-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal">Credits added instantly</p>
                  <p className="text-sm text-slate-500">Start creating tailored CVs right away</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid md:grid-cols-2 gap-4"
          >
            <div className="card p-4">
              <h4 className="font-medium text-charcoal mb-1">Do credits expire?</h4>
              <p className="text-sm text-slate-500">No, your credits never expire. Use them whenever you need.</p>
            </div>
            <div className="card p-4">
              <h4 className="font-medium text-charcoal mb-1">Can I buy more later?</h4>
              <p className="text-sm text-slate-500">Yes! Credits are cumulative. Buy more anytime.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
