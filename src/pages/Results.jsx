import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Check,
  RefreshCw,
  Minus,
  Plus,
  Download,
  Copy,
  FileText,
  Mail,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wand2,
  Loader2,
  ArrowLeft,
  X,
  Pencil,
  Save,
  Briefcase,
  Calendar,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import StatusBadge, { statusConfig, statusGroups, applicationStatuses } from '../components/StatusBadge';
import { useApplications } from '../hooks/useApplications';
import { useBaseProfile } from '../hooks/useBaseProfile';
import { useSubscription } from '../hooks/useSubscription';
import { CVTemplateSelector } from '../components/cv-templates';
import { refineBullet, refineCoverLetter, purchaseEditPack, CREDIT_COSTS, FREE_TIER } from '../lib/aiApi';

// Default empty data for when application isn't loaded yet
const emptyApplication = {
  company: '',
  role: '',
  tailored_bullets: [],
  cover_letter: '',
  professional_summary: '',
  keyword_analysis: { requirements: [], keywords: [] },
  match_score: 0,
};

// Applications List Component (shown when no ID is provided)
function ApplicationsList({ applications, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter, onDelete, onStatusChange }) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdown(null);
      }
    };
    if (statusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdown]);

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleStatusChange = async (appId, newStatus, e) => {
    e.stopPropagation();
    setStatusDropdown(null);
    const result = await onStatusChange(appId, newStatus);
    if (result?.error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${statusConfig[newStatus]?.label || newStatus}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Applications" subtitle="View and manage all your tailored applications" />
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Applications" subtitle="View and manage all your tailored applications" />

      <div className="p-4 md:p-6">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <optgroup label="Preparation">
                <option value="draft">Draft</option>
                <option value="tailored">Tailored</option>
                <option value="ready_to_send">Ready to Send</option>
              </optgroup>
              <optgroup label="In Progress">
                <option value="applied">Applied</option>
                <option value="waiting">Waiting</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
              </optgroup>
              <optgroup label="Completed">
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </optgroup>
            </select>
          </div>

          {/* New Application Button */}
          <Link to="/dashboard/new" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            New Application
          </Link>
        </motion.div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            {applications.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No applications yet</h3>
                <p className="text-slate-500 mb-6">Create your first tailored application to get started</p>
                <Link to="/dashboard/new" className="btn-primary inline-flex">
                  <PlusCircle className="w-4 h-4" />
                  Create Application
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No matching applications</h3>
                <p className="text-slate-500">Try adjusting your search or filter</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/dashboard/results/${app.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Company Initial */}
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {app.company?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Company & Role */}
                    <div>
                      <h3 className="font-semibold text-charcoal group-hover:text-teal-600 transition-colors">
                        {app.role || 'Untitled Role'}
                      </h3>
                      <p className="text-sm text-slate-500">{app.company || 'Unknown Company'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Match Score */}
                    {app.match_score > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-teal-600">{app.match_score}%</div>
                        <div className="text-xs text-slate-400">Match</div>
                      </div>
                    )}

                    {/* Status Badge with Dropdown */}
                    <div className="relative" ref={statusDropdown === app.id ? dropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdown(statusDropdown === app.id ? null : app.id);
                        }}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={app.status || 'draft'} size="small" />
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      {/* Status Dropdown */}
                      <AnimatePresence>
                        {statusDropdown === app.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {Object.entries(statusGroups).map(([groupKey, group]) => (
                              <div key={groupKey}>
                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                  {group.label}
                                </div>
                                {group.statuses.map((status) => (
                                  <button
                                    key={status}
                                    onClick={(e) => handleStatusChange(app.id, status, e)}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                                      app.status === status ? 'bg-slate-50' : ''
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${statusConfig[status]?.dot || 'bg-slate-400'}`} />
                                    {statusConfig[status]?.label || status}
                                    {app.status === status && (
                                      <Check className="w-3 h-3 text-teal-500 ml-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-slate-400 flex items-center gap-1 w-24">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(app.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/results/${app.id}`);
                        }}
                        className="p-2 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600 transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(app.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Showing {filteredApplications.length} of {applications.length} applications
              </span>
              <div className="flex items-center gap-4 text-slate-400">
                <span>{applications.filter(a => ['draft', 'tailored', 'ready_to_send'].includes(a.status)).length} preparing</span>
                <span>{applications.filter(a => ['applied', 'waiting', 'interview', 'offer'].includes(a.status)).length} in progress</span>
                <span>{applications.filter(a => ['accepted', 'rejected', 'withdrawn'].includes(a.status)).length} completed</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-charcoal mb-2">Delete Application?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This action cannot be undone. All tailored content will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generate a professional summary for the CV
function generateSummary(role, baseProfile, keywords) {
  const currentRole = baseProfile?.work_experience?.[0]?.position || role || 'Professional';
  const skills = baseProfile?.skills;
  const topSkills = [
    ...(skills?.languages || []).slice(0, 2),
    ...(skills?.frameworks || []).slice(0, 2),
  ].join(', ');

  // Use keywords from job analysis if available
  const keywordList = keywords?.slice(0, 3).map(k => k.keyword).join(', ');
  const skillsToShow = keywordList || topSkills;

  const yearsExp = baseProfile?.work_experience?.length > 1
    ? `${baseProfile.work_experience.length + 2}+`
    : '3+';

  return `Results-driven ${currentRole} with ${yearsExp} years of experience delivering high-impact solutions. ${skillsToShow ? `Skilled in ${skillsToShow}, with expertise in` : 'Expertise in'} building scalable applications and cross-functional collaboration. Committed to clean code, continuous learning, and driving measurable business outcomes.`;
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, loading: appsLoading, getApplication, updateApplication, deleteApplication, updateStatus, saveTailoredContent } = useApplications();
  const { baseProfile } = useBaseProfile();
  const { refreshProfile } = useSubscription();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBullet, setExpandedBullet] = useState(null);
  const [editingBullet, setEditingBullet] = useState(null);
  const [editText, setEditText] = useState('');
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);

  // Refinement loading states
  const [refiningBullet, setRefiningBullet] = useState(null); // bulletId:type format
  const [refiningCoverLetter, setRefiningCoverLetter] = useState(null); // 'shorter' or 'regenerate'

  // Free tier tracking
  const [freeEditsRemaining, setFreeEditsRemaining] = useState(FREE_TIER.refinements);
  const [purchasingEdits, setPurchasingEdits] = useState(false);

  // List view state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch application data on mount (only if ID provided)
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await getApplication(id);
      if (result.data) {
        setApplication(result.data);
      }
      setLoading(false);
    };
    fetchApplication();
  }, [id]);

  // If no ID, show applications list
  if (!id) {
    return (
      <ApplicationsList
        applications={applications}
        loading={appsLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onDelete={deleteApplication}
        onStatusChange={updateStatus}
      />
    );
  }

  // Get data from application or use defaults
  const bullets = application?.tailored_bullets || [];
  const coverLetter = application?.cover_letter || '';
  const requirements = application?.keyword_analysis?.requirements || [];
  const keywords = application?.keyword_analysis?.keywords || [];
  const matchScore = application?.match_score || 0;

  const acceptBullet = async (bulletId) => {
    const updatedBullets = bullets.map(b =>
      b.id === bulletId ? { ...b, accepted: true } : b
    );
    setApplication(prev => ({ ...prev, tailored_bullets: updatedBullets }));
    await updateApplication(id, { tailored_bullets: updatedBullets });
  };

  const rejectBullet = async (bulletId) => {
    const updatedBullets = bullets.map(b =>
      b.id === bulletId ? { ...b, accepted: false } : b
    );
    setApplication(prev => ({ ...prev, tailored_bullets: updatedBullets }));
    await updateApplication(id, { tailored_bullets: updatedBullets });
  };

  const startEditBullet = (bullet) => {
    setEditingBullet(bullet.id);
    setEditText(bullet.after || bullet.text);
  };

  const cancelEditBullet = () => {
    setEditingBullet(null);
    setEditText('');
  };

  const saveBulletEdit = async (bulletId) => {
    if (!editText.trim()) return;

    const updatedBullets = bullets.map(b =>
      b.id === bulletId ? { ...b, after: editText, text: editText } : b
    );
    setApplication(prev => ({ ...prev, tailored_bullets: updatedBullets }));
    await updateApplication(id, { tailored_bullets: updatedBullets });
    setEditingBullet(null);
    setEditText('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCoverLetterCopied(true);
    setTimeout(() => setCoverLetterCopied(false), 2000);
  };

  // Handle bullet refinement
  const handleRefineBullet = async (bullet, refinementType) => {
    const loadingKey = `${bullet.id}:${refinementType}`;
    setRefiningBullet(loadingKey);

    try {
      const result = await refineBullet({
        applicationId: id,
        bullet: bullet.after || bullet.text,
        refinementType,
        jobContext: application?.job_description,
      });

      // Update the bullet with refined text
      const updatedBullets = bullets.map(b =>
        b.id === bullet.id
          ? { ...b, after: result.refined, text: result.refined }
          : b
      );
      setApplication(prev => ({ ...prev, tailored_bullets: updatedBullets }));
      await updateApplication(id, { tailored_bullets: updatedBullets });

      // Update free tier tracking
      if (result.free_tier !== undefined) {
        setFreeEditsRemaining(result.free_tier.remaining);
      }

      // Show success toast
      toast.success(`Bullet refined! (${result.free_tier?.remaining || 0} edits remaining)`);

      // Show alert when edits are exhausted
      if (result.free_tier?.remaining === 0) {
        toast('No edits remaining. Buy more to continue customizing.', { duration: 5000, icon: '⚠️' });
      }

      refreshProfile?.();
    } catch (err) {
      toast.error(err.message || 'Failed to refine bullet');
    } finally {
      setRefiningBullet(null);
    }
  };

  // Handle cover letter refinement
  const handleRefineCoverLetter = async (refinementType) => {
    setRefiningCoverLetter(refinementType);

    try {
      const result = await refineCoverLetter({
        applicationId: id,
        coverLetter: application?.cover_letter,
        refinementType,
        jobDescription: refinementType === 'regenerate' ? application?.job_description : undefined,
        candidateName: baseProfile?.personal_info?.name,
      });

      // Update cover letter
      setApplication(prev => ({ ...prev, cover_letter: result.refined }));
      await updateApplication(id, { cover_letter: result.refined });

      // Update free tier tracking
      if (result.free_tier !== undefined) {
        setFreeEditsRemaining(result.free_tier.remaining);
      }

      // Show success toast
      const action = refinementType === 'regenerate' ? 'regenerated' : 'refined';
      toast.success(`Cover letter ${action}! (${result.free_tier?.remaining || 0} edits remaining)`);

      // Show alert when edits are exhausted
      if (result.free_tier?.remaining === 0) {
        toast('No edits remaining. Buy more to continue customizing.', { duration: 5000, icon: '⚠️' });
      }

      refreshProfile?.();
    } catch (err) {
      toast.error(err.message || 'Failed to refine cover letter');
    } finally {
      setRefiningCoverLetter(null);
    }
  };

  // Handle purchasing more edits
  const handlePurchaseEdits = async () => {
    setPurchasingEdits(true);
    try {
      const result = await purchaseEditPack({ applicationId: id });
      setFreeEditsRemaining(result.edits_remaining);
      toast.success(`Purchased 5 edits! (${result.edits_remaining} edits remaining)`);
      refreshProfile?.();
    } catch (err) {
      toast.error(err.message || 'Failed to purchase edits');
    } finally {
      setPurchasingEdits(false);
    }
  };

  // Calculate stats from requirements
  const coveredCount = requirements.filter(r => r.status === 'covered').length;
  const weakCount = requirements.filter(r => r.status === 'weak').length;
  const missingCount = requirements.filter(r => r.status === 'missing').length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." subtitle="Fetching application data" />
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500">Loading application...</p>
        </div>
      </div>
    );
  }

  // No application found
  if (!application) {
    return (
      <div className="min-h-screen">
        <Header title="Application Not Found" subtitle="The requested application does not exist" />
        <div className="p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Application not found</p>
          <p className="text-sm text-slate-400 mt-1">
            The application you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Application Results"
        subtitle={`${application.role || 'Untitled Role'} at ${application.company || 'Unknown Company'}`}
      />

      <div className="p-4 md:p-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl  font-bold text-charcoal">{matchScore}%</p>
                <p className="text-xs text-slate-500">Match Score</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{coveredCount}</p>
                <p className="text-xs text-slate-500">Covered</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{weakCount}</p>
                <p className="text-xs text-slate-500">Weak</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{missingCount}</p>
                <p className="text-xs text-slate-500">Missing</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Free Edits Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-charcoal">Edits for this Application</span>
              </div>
              <span className="text-sm text-slate-500">
                {freeEditsRemaining > 0 ? (
                  <>{freeEditsRemaining} remaining</>
                ) : (
                  <span className="text-amber-600">No edits remaining</span>
                )}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((freeEditsRemaining / FREE_TIER.refinements) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  freeEditsRemaining > 2
                    ? 'bg-gradient-to-r from-teal-400 to-teal-600'
                    : freeEditsRemaining > 0
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-slate-300'
                }`}
              />
            </div>
            {freeEditsRemaining === 0 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-400">
                  You've used all edits for this application.
                </p>
                <button
                  onClick={handlePurchaseEdits}
                  disabled={purchasingEdits}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {purchasingEdits ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Buy 5 edits for 0.25 credits
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Requirements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 order-2 lg:order-1"
          >
            <div className="card p-4 sticky top-24">
              <h3 className=" font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" />
                Job Requirements
              </h3>
              <div className="space-y-2">
                {requirements.length > 0 ? (
                  requirements.map((req, index) => (
                    <motion.div
                      key={req.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                        req.status === 'covered'
                          ? 'bg-emerald-50 border-emerald-100'
                          : req.status === 'weak'
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-red-50 border-red-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {req.status === 'covered' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : req.status === 'weak' ? (
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-slate-700">{req.text}</span>
                      </div>
                      {req.bullets && req.bullets.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1 ml-6">
                          Addressed in bullet {req.bullets.join(', ')}
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No requirements analyzed yet
                  </div>
                )}
              </div>

              {/* Missing Requirements Tip */}
              {missingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Tip:</span> Update your Base Profile to address missing requirements.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Middle Column - CV Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className=" font-semibold text-charcoal flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Tailored CV Bullets
                </h3>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-sm py-1.5 px-3">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {bullets.length > 0 ? (
                  bullets.map((bullet, index) => (
                    <motion.div
                      key={bullet.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`rounded-xl border-2 overflow-hidden transition-all ${
                        bullet.accepted === true
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : bullet.accepted === false
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Bullet Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-slate-400">TAILORED</span>
                              {bullet.accepted === true && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Accepted</span>
                              )}
                              {bullet.accepted === false && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Rejected</span>
                              )}
                            </div>

                            {/* Edit Mode */}
                            {editingBullet === bullet.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-3 text-sm text-charcoal leading-relaxed border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => saveBulletEdit(bullet.id)}
                                    className="btn-primary text-sm py-1.5 px-3"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditBullet}
                                    className="btn-ghost text-sm py-1.5 px-3"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p
                                className="text-sm text-charcoal leading-relaxed cursor-pointer hover:bg-slate-50 rounded p-1 -m-1 transition-colors"
                                onClick={() => setExpandedBullet(expandedBullet === bullet.id ? null : bullet.id)}
                              >
                                {bullet.after || bullet.text}
                              </p>
                            )}
                          </div>

                          {editingBullet !== bullet.id && bullet.before && (
                            <button
                              className="text-slate-400 hover:text-charcoal transition-colors"
                              onClick={() => setExpandedBullet(expandedBullet === bullet.id ? null : bullet.id)}
                            >
                              {expandedBullet === bullet.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Diff View */}
                      {bullet.before && (
                        <AnimatePresence>
                          {expandedBullet === bullet.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-slate-200"
                            >
                              <div className="p-4 bg-slate-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-medium text-slate-400">ORIGINAL</span>
                                </div>
                                <p className="text-sm text-slate-500 line-through">{bullet.before}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}

                      {/* Actions */}
                      {editingBullet !== bullet.id && (
                        <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => acceptBullet(bullet.id)}
                              className={`p-2 rounded-lg transition-all ${
                                bullet.accepted === true
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                              }`}
                              title="Accept"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectBullet(bullet.id)}
                              className={`p-2 rounded-lg transition-all ${
                                bullet.accepted === false
                                  ? 'bg-red-100 text-red-600'
                                  : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                              }`}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditBullet(bullet)}
                              className="p-2 rounded-lg transition-all hover:bg-teal-50 text-slate-400 hover:text-teal-600"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRefineBullet(bullet, 'shorter')}
                              disabled={refiningBullet !== null}
                              className="text-xs text-slate-500 hover:text-teal-600 px-2 py-1 hover:bg-teal-50 rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {refiningBullet === `${bullet.id}:shorter` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              Shorter
                            </button>
                            <button
                              onClick={() => handleRefineBullet(bullet, 'add_metrics')}
                              disabled={refiningBullet !== null}
                              className="text-xs text-slate-500 hover:text-teal-600 px-2 py-1 hover:bg-teal-50 rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {refiningBullet === `${bullet.id}:add_metrics` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              Add metrics
                            </button>
                            <button
                              onClick={() => handleRefineBullet(bullet, 'rephrase')}
                              disabled={refiningBullet !== null}
                              className="text-xs text-slate-500 hover:text-teal-600 px-2 py-1 hover:bg-teal-50 rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {refiningBullet === `${bullet.id}:rephrase` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Wand2 className="w-3 h-3" />
                              )}
                              Rephrase
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No tailored bullets yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Generate tailored CV bullets from the New Application page
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Cover Letter & Keywords */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 order-3"
          >
            <div className="space-y-4">
              {/* Cover Letter */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className=" font-semibold text-charcoal flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-600" />
                    Cover Letter
                  </h3>
                  <div className="flex items-center gap-2">
                    {coverLetter && (
                      <button
                        onClick={() => copyToClipboard(coverLetter)}
                        className="btn-ghost text-sm py-1.5 px-3"
                      >
                        {coverLetterCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  {coverLetter ? (
                    <div className="p-4 bg-warm-gray rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {coverLetter}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-warm-gray rounded-lg border border-slate-100">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No cover letter generated yet</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleRefineCoverLetter('regenerate')}
                    disabled={refiningCoverLetter !== null || !coverLetter}
                    className="btn-ghost text-sm py-1.5 px-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refiningCoverLetter === 'regenerate' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleRefineCoverLetter('shorter')}
                    disabled={refiningCoverLetter !== null || !coverLetter}
                    className="btn-ghost text-sm py-1.5 px-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refiningCoverLetter === 'shorter' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Make shorter
                  </button>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="card p-4">
                <h3 className=" font-semibold text-charcoal mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-600" />
                  Keyword Coverage
                </h3>

                <div className="space-y-3">
                  {keywords.length > 0 ? (
                    keywords.map((kw, index) => {
                      const getStatus = (count) => {
                        if (count >= 3) return 'high';
                        if (count >= 2) return 'medium';
                        if (count >= 1) return 'low';
                        return 'none';
                      };
                      const status = getStatus(kw.count || 0);

                      return (
                        <motion.div
                          key={kw.keyword || index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-slate-700">{kw.keyword}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    (kw.count || 0) >= i
                                      ? status === 'high'
                                        ? 'bg-emerald-500'
                                        : status === 'medium'
                                        ? 'bg-amber-500'
                                        : 'bg-red-400'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">
                              {kw.count || 0}x
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      No keywords analyzed yet
                    </div>
                  )}
                </div>
              </div>

              {/* Preview & Export Actions */}
              <div className="card p-4">
                <h3 className=" font-semibold text-charcoal mb-4">Export CV</h3>

                {/* Single Export Button */}
                <button
                  onClick={() => setShowCVPreview(true)}
                  className="w-full btn-primary text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CV Preview & Export Modal */}
      <AnimatePresence>
        {showCVPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCVPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-elevated w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Preview & Export CV
                  </h2>
                  <p className="text-sm text-slate-500">
                    {application?.role} at {application?.company}
                  </p>
                </div>
                <button
                  onClick={() => setShowCVPreview(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Body - Preview & Export */}
              <div className="flex-1 p-6 overflow-hidden">
                <CVTemplateSelector
                  personalInfo={{
                    name: baseProfile?.personal_info?.name || 'Your Name',
                    title: baseProfile?.personal_info?.title || baseProfile?.preferences?.roles?.[0] || application?.role?.replace(/[*\/\-–]/g, ' ').trim() || 'Professional',
                    email: baseProfile?.personal_info?.email || '',
                    phone: baseProfile?.personal_info?.phone || '',
                    location: baseProfile?.personal_info?.address || '',
                    linkedin: baseProfile?.personal_info?.linkedin || baseProfile?.links?.linkedin || '',
                    portfolio: baseProfile?.personal_info?.portfolio || baseProfile?.personal_info?.website || '',
                    photo: baseProfile?.personal_info?.photo_url || ''
                  }}
                  summary={application?.professional_summary || generateSummary(application?.role, baseProfile, keywords)}
                  experience={baseProfile?.work_experience?.map((exp, expIndex) => {
                    // Get accepted tailored bullets
                    const tailoredBullets = bullets
                      .filter((b) => b.accepted !== false)
                      .map((b) => b.after || b.text);

                    // For first experience: show tailored bullets + some original
                    // For other experiences: show original bullets
                    let expBullets;
                    if (expIndex === 0 && tailoredBullets.length > 0) {
                      // First job gets all tailored bullets
                      expBullets = tailoredBullets;
                    } else {
                      // Other jobs keep their original bullets
                      expBullets = exp.bullets || [];
                    }

                    return {
                      id: exp.id,
                      position: exp.position,
                      company: exp.company,
                      duration: exp.duration,
                      bullets: expBullets.slice(0, 5), // Show up to 5 bullets per job
                    };
                  }) || []}
                  education={(baseProfile?.education || []).map((edu) => ({
                    ...edu,
                    degree: edu.degree || edu.field_of_study || '',
                    school: edu.school || edu.institution,
                    year: edu.start_year && edu.graduation_year
                      ? `${edu.start_year}-${edu.graduation_year}`
                      : edu.year || edu.graduation_year || '',
                  }))}
                  skills={baseProfile?.skills || { languages: [], frameworks: [], tools: [] }}
                  projects={baseProfile?.projects || []}
                  onExport={() => setShowCVPreview(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
