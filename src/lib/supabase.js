import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase credentials required for app to function

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // We handle this manually in main.jsx
    },
  }
);

// Auth helper functions
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signInWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  // Clear localStorage manually since signOut may hang
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];
  const storageKey = `sb-${projectRef}-auth-token`;
  localStorage.removeItem(storageKey);

  // Try signOut but don't wait for it
  supabase.auth.signOut().catch(() => {});

  return { error: null };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });
  return { data, error };
};

export const updatePassword = async (newPassword) => {
  try {
    const updatePromise = supabase.auth.updateUser({
      password: newPassword,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Update timed out')), 5000)
    );

    const { data, error } = await Promise.race([updatePromise, timeoutPromise]);
    return { data, error };
  } catch (error) {
    return { data: null, error: { message: 'Password update timed out. Please try again.' } };
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Smart Reply conversation helpers
export const getConversations = async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      applications(company, role)
    `)
    .order('updated_at', { ascending: false });
  return { data, error };
};

export const getConversation = async (conversationId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      applications(company, role),
      conversation_messages(*)
    `)
    .eq('id', conversationId)
    .single();

  // Sort messages by created_at if we got data
  if (data?.conversation_messages) {
    data.conversation_messages.sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );
  }

  return { data, error };
};

export const deleteConversation = async (conversationId) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);
  return { error };
};

// Purchase history helper
export const getPurchaseHistory = async (userId) => {
  const { data, error } = await supabase
    .from('purchase_history')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });
  return { data, error };
};
