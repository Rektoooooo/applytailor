import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SearchProvider } from '../contexts/SearchContext';

export default function Layout() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-cream">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          <Outlet />
        </main>
      </div>
    </SearchProvider>
  );
}
