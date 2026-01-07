import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Coins, X, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Welcome to ApplyTailor!',
    message: 'Start by building your Base Profile',
    time: 'Just now',
    read: false,
  },
];

export default function Header({ title, subtitle }) {
  const location = useLocation();
  const { profile } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const credits = profile?.credits || 0;
  const [showNotifications, setShowNotifications] = useState(false);
  const isDashboard = location.pathname === '/';
  const [notifications, setNotifications] = useState(mockNotifications);
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'application':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f7]/80 backdrop-blur-md border-b border-slate-100">
      <div className="h-[73px] flex items-center justify-between px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </motion.div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - only on Dashboard */}
          {isDashboard && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-charcoal hover:bg-warm-gray rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-slate-100 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-charcoal">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                            !notification.read ? 'bg-teal-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Credits Display */}
          <Link to="/dashboard/topup">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-charcoal text-sm font-medium rounded-lg transition-all"
            >
              <Coins className="w-4 h-4 text-teal-600" />
              <span>{credits} credits</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
}
