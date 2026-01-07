import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="ApplyTailor" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-charcoal">ApplyTailor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/pricing" className="btn-ghost text-sm">
              Pricing
            </Link>
            <Link to="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-500 hover:text-charcoal hover:bg-warm-gray rounded-lg transition-all"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-slate-600 hover:bg-warm-gray hover:text-charcoal rounded-lg transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-slate-600 hover:bg-warm-gray hover:text-charcoal rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-teal-500 text-white text-center font-medium rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ApplyTailor" className="w-8 h-8 object-contain" />
            <span className="text-sm font-medium text-charcoal">ApplyTailor</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-teal-600 transition-colors">Terms</Link>
            <a href="mailto:sebastian.kucera@icloud.com" className="hover:text-teal-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ApplyTailor
          </p>
        </div>
      </footer>
    </div>
  );
}
