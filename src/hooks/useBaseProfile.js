import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useBaseProfile() {
  const { user } = useAuth();
  const [baseProfile, setBaseProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch base profile
  const fetchBaseProfile = useCallback(async () => {
    if (!user) {
      setBaseProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('base_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBaseProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBaseProfile();
  }, [fetchBaseProfile]);

  // Update base profile (uses upsert to handle both create and update)
  const updateBaseProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      setSaving(true);
      setError(null);

      // Calculate completion percentage
      const completionPercentage = calculateCompletion({ ...baseProfile, ...updates });

      const { data, error } = await supabase
        .from('base_profiles')
        .upsert(
          {
            user_id: user.id,
            ...updates,
            completion_percentage: completionPercentage,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      setBaseProfile(data);
      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setSaving(false);
    }
  };

  // Update specific section
  const updateSection = async (section, data) => {
    return updateBaseProfile({ [section]: data });
  };

  // Add item to array section (work_experience, projects, etc.)
  const addItem = async (section, item) => {
    const currentItems = baseProfile?.[section] || [];
    const newItems = [...currentItems, { ...item, id: crypto.randomUUID() }];
    return updateSection(section, newItems);
  };

  // Update item in array section
  const updateItem = async (section, itemId, updates) => {
    const currentItems = baseProfile?.[section] || [];
    const newItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    return updateSection(section, newItems);
  };

  // Remove item from array section
  const removeItem = async (section, itemId) => {
    const currentItems = baseProfile?.[section] || [];
    const newItems = currentItems.filter((item) => item.id !== itemId);
    return updateSection(section, newItems);
  };

  // Reorder items in array section
  const reorderItems = async (section, fromIndex, toIndex) => {
    const currentItems = [...(baseProfile?.[section] || [])];
    const [removed] = currentItems.splice(fromIndex, 1);
    currentItems.splice(toIndex, 0, removed);
    return updateSection(section, currentItems);
  };

  // Upload photo - converts to base64 data URL and stores in database
  const uploadPhoto = async (file) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      setSaving(true);
      setError(null);

      // Convert file to base64 data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update personal_info with photo data URL
      const currentPersonalInfo = baseProfile?.personal_info || {};
      await updateBaseProfile({
        personal_info: { ...currentPersonalInfo, photo_url: dataUrl }
      });

      return { data: dataUrl };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setSaving(false);
    }
  };

  // Update personal info
  const updatePersonalInfo = async (updates) => {
    const currentPersonalInfo = baseProfile?.personal_info || {};
    return updateBaseProfile({
      personal_info: { ...currentPersonalInfo, ...updates }
    });
  };

  return {
    baseProfile,
    loading,
    saving,
    error,
    updateBaseProfile,
    updateSection,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    uploadPhoto,
    updatePersonalInfo,
    refetch: fetchBaseProfile,
  };
}

// Calculate profile completion percentage
function calculateCompletion(profile) {
  if (!profile) return 0;

  const sections = [
    { key: 'personal_info', weight: 20, check: (v) => {
      if (!v || typeof v !== 'object') return false;
      // Check if at least name and email are filled
      return v.name?.trim()?.length > 0 && v.email?.trim()?.length > 0;
    }},
    { key: 'work_experience', weight: 20, check: (v) => Array.isArray(v) && v.length > 0 },
    { key: 'projects', weight: 15, check: (v) => Array.isArray(v) && v.length > 0 },
    { key: 'skills', weight: 15, check: (v) => {
      if (!v || typeof v !== 'object') return false;
      const { languages = [], frameworks = [], tools = [] } = v;
      return languages.length > 0 || frameworks.length > 0 || tools.length > 0;
    }},
    { key: 'education', weight: 15, check: (v) => Array.isArray(v) && v.length > 0 },
    { key: 'links', weight: 5, check: (v) => {
      if (!v || typeof v !== 'object') return false;
      return Object.values(v).some((link) => link && link.trim().length > 0);
    }},
    { key: 'achievements', weight: 10, check: (v) => Array.isArray(v) && v.length > 0 },
  ];

  let total = 0;
  for (const section of sections) {
    if (section.check(profile[section.key])) {
      total += section.weight;
    }
  }

  return total;
}
