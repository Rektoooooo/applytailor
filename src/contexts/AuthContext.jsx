import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Get access token from localStorage
  const getAccessToken = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];
    const storageKey = `sb-${projectRef}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.access_token;
    }
    return null;
  };

  // Direct fetch to Supabase REST API
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fetch user profile from profiles table using direct fetch
  const fetchProfile = async (userId) => {
    try {
      const accessToken = getAccessToken();

      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken || supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return data[0] || null;
    } catch (error) {
      return null;
    }
  };

  // Create profile if it doesn't exist
  const createProfile = async (user) => {
    try {
      const accessToken = getAccessToken();

      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        credits: 1, // New users get 1 free credit
        total_credits_purchased: 0,
      };

      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken || supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(profileData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout to getSession
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 5000)
        );

        let session = null;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          session = result.data?.session;
        } catch (e) {
          // Session timeout - will check localStorage fallback
        }

        // Always check localStorage as fallback if no session from Supabase
        if (!session) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];
          const storageKey = `sb-${projectRef}-auth-token`;
          const stored = localStorage.getItem(storageKey);

          if (stored) {
            const parsed = JSON.parse(stored);

            // Check if session is expired
            const expiresAt = parsed.expires_at;
            const now = Math.floor(Date.now() / 1000);

            if (expiresAt && expiresAt < now) {
              localStorage.removeItem(storageKey);
            } else {
              session = parsed;

              // Try to set session on Supabase client (don't wait)
              if (parsed.access_token && parsed.refresh_token) {
                supabase.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                }).catch(() => {});
              }
            }
          }
        }

        if (session?.user) {
          setUser(session.user);
          // Don't block on profile - let user in first
          setLoading(false);
          setInitialized(true);

          // Fetch profile in background with timeout
          const profileTimeout = setTimeout(() => {}, 5000);

          try {
            let userProfile = await fetchProfile(session.user.id);
            clearTimeout(profileTimeout);
            if (!userProfile) {
              userProfile = await createProfile(session.user);
            }
            setProfile(userProfile);
          } catch (e) {
            clearTimeout(profileTimeout);
          }
          return; // Early return since we already set loading/initialized
        }
      } catch (error) {
        // Auth initialization failed
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);

          // Fetch or create profile on sign in
          if (event === 'SIGNED_IN') {
            let userProfile = await fetchProfile(session.user.id);
            if (!userProfile) {
              userProfile = await createProfile(session.user);
            }
            setProfile(userProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update profile using direct fetch
  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const accessToken = getAccessToken();

      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken || supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Update local state anyway
        setProfile(prev => ({ ...prev, ...updates }));
        return { error: data };
      }

      const updatedProfile = Array.isArray(data) ? data[0] : data;
      setProfile(updatedProfile);
      return { data: updatedProfile };
    } catch (error) {
      // Update local state anyway so UI feels responsive
      setProfile(prev => ({ ...prev, ...updates }));
      return { data: { ...profile, ...updates } };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await fetchProfile(user.id);
    if (userProfile) {
      setProfile(userProfile);
    }
  };

  // Check if user can create new application (credits-based)
  const canCreateApplication = () => {
    if (!profile) return false;
    // Check if user has credits
    return (profile.credits || 0) > 0;
  };

  // Get remaining credits
  const getRemainingCredits = () => {
    if (!profile) return 0;
    return profile.credits || 0;
  };

  const value = {
    user,
    profile,
    loading,
    initialized,
    updateProfile,
    refreshProfile,
    canCreateApplication,
    getRemainingCredits,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
