import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Copy,
  Check,
  Send,
  Loader2,
  Trash2,
  Briefcase,
  Calendar,
  ThumbsDown,
  Gift,
  MessageCircle,
  Mail,
  User,
  Bot,
  Sparkles,
  PenLine,
} from 'lucide-react';
import Header from '../components/Header';
import { getConversation, deleteConversation } from '../lib/supabase';
import { generateReply, checkFreeReplies, CREDIT_COSTS, FREE_TIER } from '../lib/aiApi';

// Message type config
const MESSAGE_TYPE_CONFIG = {
  compose: { icon: PenLine, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Compose' },
  interview: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Interview' },
  rejection: { icon: ThumbsDown, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Rejection' },
  offer: { icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Offer' },
  follow_up: { icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Follow-up' },
  other: { icon: Mail, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Other' },
};

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SmartReplyConversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [freeTier, setFreeTier] = useState({ remaining: FREE_TIER.replies, total: FREE_TIER.replies });

  useEffect(() => {
    loadConversation();
    loadFreeTier();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.conversation_messages]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const { data, error } = await getConversation(id);
      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
      navigate('/smart-reply');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCopy = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    setDeleting(true);
    try {
      const { error } = await deleteConversation(id);
      if (error) throw error;
      toast.success('Conversation deleted');
      navigate('/smart-reply');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!newMessage.trim()) {
      toast.error('Please paste a follow-up message');
      return;
    }

    if (newMessage.trim().length < 20) {
      toast.error('Message must be at least 20 characters');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateReply({
        pastedMessage: newMessage.trim(),
        userInstructions: instructions.trim() || undefined,
        applicationId: conversation.application_id || undefined,
        conversationId: id,
      });

      if (result.error) throw new Error(result.error);

      // Reload conversation to show new messages
      await loadConversation();
      await loadFreeTier();
      setNewMessage('');
      setInstructions('');
      toast.success('Follow-up generated!');
    } catch (error) {
      console.error('Generate error:', error);
      toast.error(error.message || 'Failed to generate follow-up');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const typeConfig = MESSAGE_TYPE_CONFIG[conversation.message_type] || MESSAGE_TYPE_CONFIG.other;
  const TypeIcon = typeConfig.icon;
  const costText = freeTier.remaining > 0
    ? `${freeTier.remaining} free remaining`
    : `${CREDIT_COSTS.smart_reply} credits`;

  // Group messages for display
  const messages = conversation.conversation_messages || [];

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <Header
        title={conversation.title}
        subtitle={
          conversation.applications
            ? `${conversation.applications.role} at ${conversation.applications.company}`
            : undefined
        }
      />

      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/smart-reply')}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {/* Message Type Badge */}
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 ${typeConfig.bg} ${typeConfig.color}`}>
              <TypeIcon className="w-4 h-4" />
              {typeConfig.label}
            </span>

            {/* Linked Application */}
            {conversation.applications && (
              <span className="px-3 py-1 rounded-full text-sm flex items-center gap-1.5 bg-slate-50 text-slate-600">
                <Briefcase className="w-4 h-4" />
                {conversation.applications.company}
              </span>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant';
              const isSubject = message.role === 'subject';
              const isInstruction = message.role === 'instruction';
              const isPasted = message.role === 'pasted';
              const isAIGenerated = isAssistant || isSubject;

              // Skip instruction messages in main view (show inline)
              if (isInstruction) return null;

              // Show date separator if needed
              const showDate = index === 0 || formatDate(message.created_at) !== formatDate(messages[index - 1]?.created_at);

              // Determine label text
              let labelText;
              if (isSubject) {
                labelText = 'Subject Line';
              } else if (isAssistant) {
                labelText = conversation.message_type === 'compose' ? 'Email Body' : 'Generated Reply';
              } else {
                labelText = conversation.message_type === 'compose' ? 'Your Request' : 'Received Message';
              }

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAIGenerated ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${isAIGenerated ? 'order-1' : ''}`}>
                      {/* Label */}
                      <div className={`flex items-center gap-2 mb-1 ${isAIGenerated ? 'justify-end' : ''}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isAIGenerated ? 'bg-teal-100' : 'bg-slate-100'
                        }`}>
                          {isAIGenerated ? (
                            <Bot className="w-3 h-3 text-teal-600" />
                          ) : (
                            <User className="w-3 h-3 text-slate-600" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {labelText}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatTime(message.created_at)}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div className={`relative rounded-2xl p-4 ${
                        isSubject
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                          : isAssistant
                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                            : 'bg-slate-100 text-charcoal'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>

                        {/* Copy Button for AI Generated Messages */}
                        {isAIGenerated && (
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="absolute bottom-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Show instruction if this pasted message had one */}
                      {isPasted && messages[index + 1]?.role === 'instruction' && (
                        <div className="mt-2 text-xs text-slate-500 italic pl-7">
                          Instructions: "{messages[index + 1].content}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Continue Conversation / Rewrite */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <h4 className="text-sm font-medium text-charcoal mb-3">
              {conversation.message_type === 'compose' ? 'Rewrite Email' : 'Continue Conversation'}
            </h4>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={conversation.message_type === 'compose'
                ? "Describe how you want to change the email..."
                : "Paste a follow-up message..."}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
            />

            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={conversation.message_type === 'compose'
                ? "e.g., 'Make it shorter', 'More casual tone', 'Add my portfolio link'"
                : "Additional instructions (optional)"}
              className="w-full mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3 h-3 text-teal-500" />
                {costText}
              </div>
              <button
                onClick={handleGenerateFollowUp}
                disabled={generating || !newMessage.trim()}
                className="btn-primary text-sm py-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {conversation.message_type === 'compose' ? 'Rewriting...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <PenLine className="w-4 h-4" />
                    {conversation.message_type === 'compose' ? 'Rewrite' : 'Generate Follow-up'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
