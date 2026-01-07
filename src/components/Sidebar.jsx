import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  PlusCircle,
  FileText,
  Settings,
  LogOut,
  Coins,
  X,
  MessageSquareReply
} from 'lucide-react';
import { LogoIcon } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useBaseProfile } from '../hooks/useBaseProfile';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import { signOut } from '../lib/supabase';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/profile', icon: User, label: 'Base Profile' },
  { to: '/dashboard/new', icon: PlusCircle, label: 'New Application' },
  { to: '/dashboard/results', icon: FileText, label: 'Applications' },
  { to: '/smart-reply', icon: MessageSquareReply, label: 'Smart Reply' },
];

const bottomItems = [
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { baseProfile } = useBaseProfile();
  const { isOpen, closeMenu } = useMobileMenu();
  const credits = profile?.credits || 0;

  // Get profile photo URL
  const photoUrl = baseProfile?.personal_info?.photo_url;

  const handleSignOut = async () => {
    await signOut();
    // Force full page reload to clear all state
    window.location.href = '/landing';
  };

  // Get user initials
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  // Handle nav item click - close menu on mobile
  const handleNavClick = () => {
    closeMenu();
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-[73px] px-6 flex items-center border-b border-slate-100 justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={handleNavClick}>
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <LogoIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight">ApplyTailor</h1>
            <p className="text-xs text-slate-400">Smart job applications</p>
          </div>
        </NavLink>

        {/* Close button - only visible on mobile */}
        <button
          onClick={closeMenu}
          className="md:hidden p-2 text-slate-400 hover:text-charcoal hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600'
                    : 'text-slate-600 hover:bg-warm-gray hover:text-charcoal'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Credits Display */}
      <div className="px-4 mb-2">
        <NavLink
          to="/dashboard/topup"
          onClick={handleNavClick}
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-lg hover:from-teal-100 hover:to-teal-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <span className="font-medium text-sm">Credits</span>
          </div>
          <span className="font-bold">{credits}</span>
        </NavLink>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-warm-gray hover:text-charcoal'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <NavLink to="/dashboard/settings" onClick={handleNavClick} className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-white">{getInitials()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">
              {baseProfile?.personal_info?.name || profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">{baseProfile?.personal_info?.email || user?.email}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
