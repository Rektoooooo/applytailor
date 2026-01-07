import { Outlet, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LogoIcon } from './Logo';

export default function PublicLayout() {
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
            <Link to="/pricing" className="btn-ghost text-sm hidden sm:flex">
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
        </div>
      </nav>

      {/* Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <LogoIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-charcoal">ApplyTailor</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ApplyTailor
          </p>
        </div>
      </footer>
    </div>
  );
}
