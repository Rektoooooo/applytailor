import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'applytailor_notifications';
const DISMISSED_KEY = 'applytailor_dismissed_notifications';

// Notification types and their icons
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  APPLICATION: 'application',
};

// Generate dynamic notifications based on user state
function generateDynamicNotifications(profile, dismissedIds) {
  const notifications = [];
  const now = new Date();

  // Welcome notification - only show once
  if (!dismissedIds.includes('welcome')) {
    notifications.push({
      id: 'welcome',
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Welcome to ApplyTailor!',
      message: 'Start by building your Base Profile to get personalized CVs.',
      time: 'Just now',
      read: false,
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
        read: false,
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
        read: false,
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
        read: false,
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
        read: false,
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
        read: false,
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

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading dismissed notifications:', e);
    }
  }, []);

  // Generate notifications when profile or dismissedIds change
  useEffect(() => {
    const dynamicNotifications = generateDynamicNotifications(profile, dismissedIds);
    setNotifications(dynamicNotifications);
  }, [profile, dismissedIds]);

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

  // Mark all as read (just removes unread styling, doesn't dismiss)
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Reset all dismissed notifications (for testing)
  const resetDismissed = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY);
    setDismissedIds([]);
  }, []);

  return {
    notifications,
    unreadCount,
    dismissNotification,
    markAllRead,
    markAsRead,
    resetDismissed,
  };
}
