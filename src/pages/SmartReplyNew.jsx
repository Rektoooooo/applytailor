import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Send,
  Loader2,
  Calendar,
  ThumbsDown,
  Gift,
  MessageCircle,
  Mail,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Header from '../components/Header';
import { useApplications } from '../hooks/useApplications';
import { generateReply, checkFreeReplies, CREDIT_COSTS, FREE_TIER } from '../lib/aiApi';

const MESSAGE_TYPES = [
  { value: 'interview', label: 'Interview Invite', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'rejection', label: 'Rejection', icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  { value: 'follow_up', label: 'Follow-up', icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'offer', label: 'Offer', icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'other', label: 'Other', icon: Mail, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
];

export default function SmartReplyNew() {
  const navigate = useNavigate();
  const { applications, loading: appsLoading } = useApplications();

  const [pastedMessage, setPastedMessage] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [messageType, setMessageType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [freeTier, setFreeTier] = useState({ remaining: FREE_TIER.replies, total: FREE_TIER.replies });

  useEffect(() => {
    loadFreeTier();
  }, []);

  const loadFreeTier = async () => {
    try {
      const result = await checkFreeReplies();
      if (result?.free_tier) {
        setFreeTier({
          remaining: result.free_tier.remaining,
          total: result.free_tier.total,
        });
      }
    } catch (error) {
      console.error('Error loading free tier:', error);
    }
  };

  const handleGenerate = async () => {
    if (!pastedMessage.trim()) {
      toast.error('Please paste a message to generate a reply');
      return;
    }

    if (pastedMessage.trim().length < 20) {
      toast.error('Message must be at least 20 characters');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateReply({
        pastedMessage: pastedMessage.trim(),
        userInstructions: userInstructions.trim() || undefined,
        applicationId: selectedApp || undefined,
        messageType: messageType || undefined,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Reply generated successfully!');
      navigate(`/smart-reply/${result.conversation_id}`);
    } catch (error) {
      console.error('Generate error:', error);
      toast.error(error.message || 'Failed to generate reply. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const costText = freeTier.remaining > 0
    ? `${freeTier.remaining} free repl${freeTier.remaining === 1 ? 'y' : 'ies'} remaining`
    : `${CREDIT_COSTS.smart_reply} credits`;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header
        title="New Smart Reply"
        subtitle="Generate a professional response to an email"
      />

      <motion.div
        className="p-4 md:p-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/smart-reply')}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to conversations
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          {/* Link to Application (Optional) */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Link to Application (optional)
            </label>
            <div className="relative">
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                disabled={appsLoading}
                className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-charcoal appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">No application selected</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.role || 'Untitled'} at {app.company || 'Unknown'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Linking provides context for more relevant replies
            </p>
          </div>

          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MESSAGE_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = messageType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setMessageType(isSelected ? '' : type.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${type.bg} ${type.border} ${type.color}`
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <TypeIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Auto-detected if not selected
            </p>
          </div>

          {/* Paste Message */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Paste the message you received <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={pastedMessage}
              onChange={(e) => setPastedMessage(e.target.value)}
              placeholder="Dear [Name],

Thank you for your application. We would like to invite you for an interview..."
              rows={8}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {pastedMessage.length}/10,000 characters
            </p>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Additional instructions (optional)
            </label>
            <input
              type="text"
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder='e.g., "Keep it brief", "Ask about remote work policy", "Sound enthusiastic"'
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Customize how the reply is generated
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-4 h-4 text-teal-500" />
              {costText}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !pastedMessage.trim()}
              className="btn-primary"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Reply
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
