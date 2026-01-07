import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  MessageSquare,
  Trash2,
  ArrowRight,
  Loader2,
  Mail,
  Calendar,
  ThumbsDown,
  Briefcase,
  Gift,
  MessageCircle,
} from 'lucide-react';
import Header from '../components/Header';
import { getConversations, deleteConversation } from '../lib/supabase';
import { checkFreeReplies, FREE_TIER } from '../lib/aiApi';

// Convert ISO date to relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Message type icons and colors
const MESSAGE_TYPE_CONFIG = {
  interview: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Interview' },
  rejection: { icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Rejection' },
  offer: { icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Offer' },
  follow_up: { icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Follow-up' },
  other: { icon: Mail, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Other' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SmartReply() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freeTier, setFreeTier] = useState({ used: 0, remaining: FREE_TIER.replies, total: FREE_TIER.replies });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conversationsResult, freeTierResult] = await Promise.all([
        getConversations(),
        checkFreeReplies(),
      ]);

      if (conversationsResult.error) {
        console.error('Error loading conversations:', conversationsResult.error);
      } else {
        setConversations(conversationsResult.data || []);
      }

      if (freeTierResult?.free_tier) {
        setFreeTier({
          used: freeTierResult.free_tier.used,
          remaining: freeTierResult.free_tier.remaining,
          total: freeTierResult.free_tier.total,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, conversationId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    setDeletingId(conversationId);
    try {
      const { error } = await deleteConversation(conversationId);
      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const freeRepliesPercentage = Math.round((freeTier.remaining / freeTier.total) * 100);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header
        title="Smart Reply"
        subtitle="Generate professional responses to job application emails"
      />

      <motion.div
        className="p-4 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Free Tier Progress */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-100 p-4 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-charcoal">Free Replies</span>
            </div>
            <span className="text-sm text-slate-500">
              {freeTier.remaining} of {freeTier.total} remaining
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${freeRepliesPercentage}%` }}
            />
          </div>
          {freeTier.remaining === 0 && (
            <p className="text-xs text-slate-500 mt-2">
              0.1 credits per reply after free tier
            </p>
          )}
        </motion.div>

        {/* New Reply Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link
            to="/smart-reply/new"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Reply
          </Link>
        </motion.div>

        {/* Conversations List */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Conversations
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({conversations.length})
            </span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
                <p className="text-slate-500">Loading conversations...</p>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation, index) => {
                const typeConfig = MESSAGE_TYPE_CONFIG[conversation.message_type] || MESSAGE_TYPE_CONFIG.other;
                const TypeIcon = typeConfig.icon;

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={`/smart-reply/${conversation.id}`}
                      className="flex items-center justify-between p-4 hover:bg-warm-gray transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-charcoal group-hover:text-teal-700 transition-colors truncate">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            {conversation.applications && (
                              <span className="flex items-center gap-1 truncate">
                                <Briefcase className="w-3 h-3" />
                                {conversation.applications.company}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${typeConfig.bg} ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {getRelativeTime(conversation.updated_at)}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, conversation.id)}
                          disabled={deletingId === conversation.id}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {deletingId === conversation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No conversations yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Create your first smart reply to get started
                </p>
                <Link to="/smart-reply/new" className="btn-primary mt-4 inline-flex">
                  <Plus className="w-4 h-4" />
                  Create Reply
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
