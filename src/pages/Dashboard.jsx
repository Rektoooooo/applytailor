import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  User,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Target,
  SearchX,
  Loader2
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useSearch } from '../contexts/SearchContext';
import { useApplications } from '../hooks/useApplications';
import { useBaseProfile } from '../hooks/useBaseProfile';

// Convert ISO date to relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { searchQuery } = useSearch();
  const { applications, loading: appsLoading, getStats } = useApplications();
  const { baseProfile, loading: profileLoading } = useBaseProfile();

  // Get real stats from applications
  const appStats = getStats();

  // Build stats array with real data - showing actionable application tracking metrics
  const stats = [
    { label: 'This Month', value: String(appStats.thisMonth), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: String(appStats.inProgress), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Success Rate', value: appStats.completed > 0 ? `${appStats.successRate}%` : '-', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Score', value: appStats.total > 0 ? `${appStats.avgScore}%` : '-', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Get profile completion percentage
  const profileCompletion = baseProfile?.completion_percentage || 0;

  // Filter applications based on search query
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (app.company || '').toLowerCase().includes(query) ||
      (app.role || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's your application overview."
      />

      <motion.div
        className="p-4 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* New Application Card */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/dashboard/new" className="block group h-full">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg  font-semibold text-charcoal mb-2">
                  Create New Application
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Paste a job description and get tailored CV bullets, cover letter, and keyword analysis in seconds.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Base Profile Card */}
          <motion.div variants={itemVariants} className="h-full">
            <Link to="/dashboard/profile" className="block group h-full">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg  font-semibold text-charcoal mb-2">
                  My Base Profile
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Update your experience, skills, and achievements. This data powers all your tailored applications.
                </p>
                {baseProfile?.completion_percentage !== undefined && baseProfile.completion_percentage < 100 && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${baseProfile.completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{baseProfile.completion_percentage}% complete</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl  font-bold text-charcoal">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Applications */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg  font-semibold text-charcoal">
              {searchQuery ? `Search Results` : 'Recent Applications'}
              {searchQuery && (
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({filteredApplications.length} found)
                </span>
              )}
            </h2>
            <Link to="/dashboard/results" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {appsLoading ? (
              <div className="p-6 md:p-8 text-center">
                <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
                <p className="text-slate-500">Loading applications...</p>
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.slice(0, 5).map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    to={`/dashboard/results/${app.id}`}
                    className="flex items-center justify-between p-4 hover:bg-warm-gray transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-charcoal group-hover:text-teal-700 transition-colors">
                          {app.role || 'Untitled Role'}
                        </h3>
                        <p className="text-sm text-slate-500">{app.company || 'Unknown Company'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {app.match_score && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-charcoal">{app.match_score}%</p>
                          <p className="text-xs text-slate-400">Match</p>
                        </div>
                      )}
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-slate-400 hidden md:block w-20 text-right">
                        {getRelativeTime(app.created_at)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : searchQuery ? (
              <div className="p-6 md:p-8 text-center">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No applications found</p>
                <p className="text-sm text-slate-400 mt-1">
                  No results for "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="p-6 md:p-8 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No applications yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Create your first application to get started
                </p>
                <Link to="/dashboard/new" className="btn-primary mt-4 inline-flex">
                  <PlusCircle className="w-4 h-4" />
                  Create Application
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          className="mt-8 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100"
          variants={itemVariants}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal mb-1">Pro Tip</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Applications with a complete Base Profile score <span className="font-semibold text-teal-600">23% higher</span> on average.
                Add your achievements with measurable outcomes to stand out.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
