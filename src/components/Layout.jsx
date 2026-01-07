import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SearchProvider } from '../contexts/SearchContext';

export default function Layout() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-cream flex flex-col">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          {/* Footer */}
          <footer className="py-4 px-6 border-t border-slate-100 bg-white/50">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-600 transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-slate-200">|</span>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-600 transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-slate-200">|</span>
              <a
                href="mailto:sebastian.kucera@icloud.com"
                className="hover:text-teal-600 transition-colors"
              >
                Contact
              </a>
            </div>
          </footer>
        </main>
      </div>
    </SearchProvider>
  );
}
