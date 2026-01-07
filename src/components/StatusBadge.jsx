import { motion } from 'framer-motion';

// Application status configuration
export const statusConfig = {
  // Preparation statuses
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    group: 'preparation',
  },
  tailored: {
    label: 'Tailored',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    group: 'preparation',
  },
  ready_to_send: {
    label: 'Ready to Send',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    group: 'preparation',
  },

  // In Progress statuses
  applied: {
    label: 'Applied',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    group: 'in_progress',
  },
  waiting: {
    label: 'Waiting',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    group: 'in_progress',
  },
  interview: {
    label: 'Interview',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    group: 'in_progress',
  },
  offer: {
    label: 'Offer',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    group: 'in_progress',
  },

  // Completed statuses
  accepted: {
    label: 'Accepted',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    group: 'completed',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    group: 'completed',
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
    group: 'completed',
  },

  // Legacy status (for backwards compatibility)
  exported: {
    label: 'Exported',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    group: 'preparation',
  },

  // Requirement statuses (used for job requirements analysis)
  covered: {
    label: 'Covered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  weak: {
    label: 'Weak',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  missing: {
    label: 'Missing',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

// Grouped statuses for dropdowns
export const statusGroups = {
  preparation: {
    label: 'Preparation',
    statuses: ['draft', 'tailored', 'ready_to_send'],
  },
  in_progress: {
    label: 'In Progress',
    statuses: ['applied', 'waiting', 'interview', 'offer'],
  },
  completed: {
    label: 'Completed',
    statuses: ['accepted', 'rejected', 'withdrawn'],
  },
};

// All application statuses (excluding requirement statuses)
export const applicationStatuses = [
  'draft', 'tailored', 'ready_to_send',
  'applied', 'waiting', 'interview', 'offer',
  'accepted', 'rejected', 'withdrawn',
];

export default function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status] || statusConfig.draft;

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bg} ${config.text} font-medium rounded-full`}
    >
      <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
      {config.label}
    </motion.span>
  );
}
