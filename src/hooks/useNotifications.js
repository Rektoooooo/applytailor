import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DISMISSED_KEY = 'applytailor_dismissed_notifications';
const READ_KEY = 'applytailor_read_notifications';

// Notification types and their icons
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  APPLICATION: 'application',
};

// Generate dynamic notifications based on user state
function generateDynamicNotifications(profile, dismissedIds, readIds) {
  const notifications = [];

  // Welcome notification - only show once
  if (!dismissedIds.includes('welcome')) {
    notifications.push({
      id: 'welcome',
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Welcome to ApplyTailor!',
      message: 'Start by building your Base Profile to get personalized CVs.',
      time: 'Just now',
      read: readIds.includes('welcome'),
      link: '/dashboard/profile',
    });
  }

  if (profile) {
    // Low credits warning
    const credits = parseFloat(profile.credits) || 0;
    if (credits < 1 && credits > 0 && !dismissedIds.includes('low_credits')) {
      notifications.push({
        id: 'low_credits',
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Running low on credits',
        message: `You have ${credits.toFixed(2)} credits remaining. Top up to continue generating CVs.`,
        time: 'Now',
        read: readIds.includes('low_credits'),
        link: '/dashboard/topup',
      });
    }

    // No credits warning
    if (credits === 0 && !dismissedIds.includes('no_credits')) {
      notifications.push({
        id: 'no_credits',
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Out of credits',
        message: 'Top up your credits to generate tailored CVs and cover letters.',
        time: 'Now',
        read: readIds.includes('no_credits'),
        link: '/dashboard/topup',
      });
    }

    // Profile incomplete - check if basic info is missing
    const hasBasicProfile = profile.full_name && profile.email;
    if (!hasBasicProfile && !dismissedIds.includes('incomplete_profile')) {
      notifications.push({
        id: 'incomplete_profile',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Complete your profile',
        message: 'Add your details to generate better tailored applications.',
        time: 'Tip',
        read: readIds.includes('incomplete_profile'),
        link: '/dashboard/profile',
      });
    }

    // First application tip
    if (!dismissedIds.includes('first_app_tip')) {
      notifications.push({
        id: 'first_app_tip',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Ready to apply?',
        message: 'Paste a job description to generate a tailored CV instantly.',
        time: 'Tip',
        read: readIds.includes('first_app_tip'),
        link: '/dashboard/new',
      });
    }

    // Smart Reply feature tip
    if (!dismissedIds.includes('smart_reply_tip')) {
      notifications.push({
        id: 'smart_reply_tip',
        type: NOTIFICATION_TYPES.INFO,
        title: 'New: Smart Reply',
        message: 'Generate professional responses to recruiter emails with AI.',
        time: 'New feature',
        read: readIds.includes('smart_reply_tip'),
        link: '/smart-reply',
      });
    }
  }

  return notifications;
}

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [readIds, setReadIds] = useState([]);

  // Load dismissed and read IDs from localStorage on mount
  useEffect(() => {
    try {
      const storedDismissed = localStorage.getItem(DISMISSED_KEY);
      if (storedDismissed) {
        setDismissedIds(JSON.parse(storedDismissed));
      }
      const storedRead = localStorage.getItem(READ_KEY);
      if (storedRead) {
        setReadIds(JSON.parse(storedRead));
      }
    } catch (e) {
      console.error('Error loading notification state:', e);
    }
  }, []);

  // Generate notifications when profile, dismissedIds, or readIds change
  useEffect(() => {
    const dynamicNotifications = generateDynamicNotifications(profile, dismissedIds, readIds);
    setNotifications(dynamicNotifications);
  }, [profile, dismissedIds, readIds]);

  // Dismiss a notification (permanently)
  const dismissNotification = useCallback((id) => {
    setDismissedIds((prev) => {
      const newDismissed = [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed));
      } catch (e) {
        console.error('Error saving dismissed notifications:', e);
      }
      return newDismissed;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Mark all as read (persists to localStorage)
  const markAllRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => {
      const newReadIds = [...new Set([...prev, ...allIds])];
      try {
        localStorage.setItem(READ_KEY, JSON.stringify(newReadIds));
      } catch (e) {
        console.error('Error saving read notifications:', e);
      }
      return newReadIds;
    });
  }, [notifications]);

  // Mark single notification as read (persists to localStorage)
  const markAsRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const newReadIds = [...prev, id];
      try {
        localStorage.setItem(READ_KEY, JSON.stringify(newReadIds));
      } catch (e) {
        console.error('Error saving read notifications:', e);
      }
      return newReadIds;
    });
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Reset all notification state (for testing)
  const resetNotifications = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    localStorage.removeItem(READ_KEY);
    setDismissedIds([]);
    setReadIds([]);
  }, []);

  return {
    notifications,
    unreadCount,
    dismissNotification,
    markAllRead,
    markAsRead,
    resetNotifications,
  };
}
