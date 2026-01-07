import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useApplications() {
  const { user, profile, refreshProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Get single application
  const getApplication = async (id) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Create new application
  const createApplication = async (applicationData) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          ...applicationData,
        })
        .select()
        .single();

      if (error) throw error;

      setApplications((prev) => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Update application
  const updateApplication = async (id, updates) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return { data };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Delete application
  const deleteApplication = async (id) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setApplications((prev) => prev.filter((app) => app.id !== id));
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Update application status
  const updateStatus = async (id, status) => {
    return updateApplication(id, { status });
  };

  // Save tailored content (deducts 1 credit)
  const saveTailoredContent = async (id, { tailored_bullets, cover_letter, keyword_analysis, match_score }) => {
    // Check if user has credits
    const currentCredits = profile?.credits || 0;
    if (currentCredits <= 0) {
      return { error: 'No credits remaining. Please purchase more credits to continue.' };
    }

    // First save the tailored content
    const result = await updateApplication(id, {
      tailored_bullets,
      cover_letter,
      keyword_analysis,
      match_score,
      status: 'tailored',
    });

    if (result.error) {
      return result;
    }

    // Deduct 1 credit from user's profile
    try {
      await supabase
        .from('profiles')
        .update({ credits: currentCredits - 1 })
        .eq('id', user.id);

      // Refresh profile to update local state
      refreshProfile?.();
    } catch (err) {
      // Credit deduction failed but content was saved - log but don't fail
      console.error('Failed to deduct credit:', err);
    }

    return result;
  };

  // Get statistics
  const getStats = () => {
    const total = applications.length;
    const byStatus = {
      // Preparation
      draft: applications.filter((a) => a.status === 'draft').length,
      tailored: applications.filter((a) => a.status === 'tailored').length,
      ready_to_send: applications.filter((a) => a.status === 'ready_to_send').length,
      // In Progress
      applied: applications.filter((a) => a.status === 'applied').length,
      waiting: applications.filter((a) => a.status === 'waiting').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      offer: applications.filter((a) => a.status === 'offer').length,
      // Completed
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
      withdrawn: applications.filter((a) => a.status === 'withdrawn').length,
      // Legacy
      exported: applications.filter((a) => a.status === 'exported').length,
    };

    // Grouped counts
    const preparing = byStatus.draft + byStatus.tailored + byStatus.ready_to_send;
    const inProgress = byStatus.applied + byStatus.waiting + byStatus.interview + byStatus.offer;
    const completed = byStatus.accepted + byStatus.rejected + byStatus.withdrawn;

    const avgScore = applications.reduce((acc, a) => acc + (a.match_score || 0), 0) / (total || 1);

    // This month
    const now = new Date();
    const thisMonth = applications.filter((a) => {
      const created = new Date(a.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Success rate (accepted / completed * 100)
    const successRate = completed > 0 ? Math.round((byStatus.accepted / completed) * 100) : 0;

    return { total, byStatus, preparing, inProgress, completed, avgScore: Math.round(avgScore), thisMonth, successRate };
  };

  return {
    applications,
    loading,
    error,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
    saveTailoredContent,
    getStats,
    refetch: fetchApplications,
  };
}
