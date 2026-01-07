import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, ArrowRight, Loader2, Sparkles, Zap, Crown } from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { CREDIT_PACKAGES } from '../lib/stripe';

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const { startCheckout } = useSubscription();
  const [loading, setLoading] = useState(null);

  const handlePurchase = async (packageKey) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    const pkg = CREDIT_PACKAGES[packageKey];
    if (!pkg.priceId) {
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
      credits: 20,
      price: '$5',
      pricePerCV: '$0.25',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      features: [
        '20 CV generations',
        'All templates included',
        'PDF export',
        'Cover letters',
        'Credits never expire',
      ],
    },
    {
      key: 'standard',
      name: 'Standard',
      credits: 50,
      price: '$10',
      pricePerCV: '$0.20',
      icon: Sparkles,
      color: 'from-teal-500 to-teal-600',
      popular: true,
      features: [
        '50 CV generations',
        'All templates included',
        'PDF export',
        'Cover letters',
        'Credits never expire',
        'Best value',
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      credits: 100,
      price: '$15',
      pricePerCV: '$0.15',
      icon: Crown,
      color: 'from-amber-500 to-amber-600',
      features: [
        '100 CV generations',
        'All templates included',
        'PDF export',
        'Cover letters',
        'Credits never expire',
        'Lowest per-CV cost',
      ],
    },
  ];

  const currentCredits = profile?.credits || 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
              <LogoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-charcoal">ApplyTailor</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-500">
                  {currentCredits} credits
                </span>
                <Link to="/" className="btn-ghost text-sm">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Simple credit packages
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Buy credits once, use them anytime. No subscriptions, no monthly fees.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            New users get 1 free credit to try
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`card p-8 relative ${
                pkg.popular ? 'border-2 border-teal-500 shadow-lg' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center mb-6`}>
                <pkg.icon className="w-6 h-6 text-white" />
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-charcoal mb-1">{pkg.name}</h2>
                <p className="text-slate-500">{pkg.credits} CV generations</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-charcoal">{pkg.price}</span>
                <span className="text-slate-500 ml-2">one-time</span>
                <div className="text-sm text-teal-600 mt-1">
                  {pkg.pricePerCV} per CV
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(pkg.key)}
                disabled={loading === pkg.key}
                className={`w-full ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === pkg.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Buy {pkg.credits} Credits
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How Credits Work */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-charcoal mb-8 text-center">How Credits Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Purchase Credits</h3>
              <p className="text-sm text-slate-600">
                Buy a credit package that fits your job search needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Generate CVs</h3>
              <p className="text-sm text-slate-600">
                Each tailored CV uses 1 credit. Regenerate as needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Never Expire</h3>
              <p className="text-sm text-slate-600">
                Your credits stay with you forever. No pressure to use them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                q: 'Do credits expire?',
                a: 'No! Your credits never expire. Use them whenever you need them.',
              },
              {
                q: 'What counts as 1 credit?',
                a: 'Each time you generate a tailored CV for a job posting, it uses 1 credit.',
              },
              {
                q: 'Can I buy more credits later?',
                a: 'Absolutely! Credits are cumulative. Buy more packages anytime.',
              },
              {
                q: 'Do I get a free trial?',
                a: 'Yes! New users automatically get 1 free credit to try the service.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-charcoal mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <LogoIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-charcoal">ApplyTailor</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-teal-600 transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ApplyTailor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
