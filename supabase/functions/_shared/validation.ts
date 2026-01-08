// Input validation, rate limiting, and security utilities

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.38.4';

// Rate limits configuration
const RATE_LIMITS = {
  generation: {
    per_hour: 30,
    per_day: 100,
  },
  refinement: {
    per_hour: 60,
    per_day: 200,
  },
};

// Credit costs
export const CREDIT_COSTS = {
  generation: 1.0,         // Full package (CV + Cover Letter)
  generation_cv: 0.75,     // CV only
  generation_cover: 0.25,  // Cover letter only
  regenerate_bullets: 0.5,
  regenerate_cover: 0.5,
  refine_bullet: 0.25,  // After free tier
  refine_cover: 0.25,   // After free tier
  smart_reply: 0.1,      // After free tier (3 free replies)
  reply_pack: 0.10,      // 5 replies for 0.10 credits
};

// Free tier configuration
export const FREE_TIER = {
  refinements: 5,  // First 5 refinements are free per application
  replies: 3,      // First 3 smart replies are free (lifetime)
  repliesPerPack: 5, // Each purchased pack gives 5 replies
};

// Input limits
const INPUT_LIMITS = {
  job_description: { min: 50, max: 10000 },
  bullet: { min: 10, max: 500 },
  cover_letter: { min: 50, max: 2000 },
};

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client with service role
export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  );
}

// Verify JWT and get user ID
export async function verifyAuth(req: Request): Promise<{ userId: string } | { error: string }> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_ANON_KEY') as string,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error?.message || 'No user found');
      return { error: error?.message || 'Invalid token' };
    }

    return { userId: user.id };
  } catch (error) {
    console.error('Auth exception:', error);
    return { error: 'Authentication failed' };
  }
}

// Get smart reply usage stats for user (lifetime)
export async function getSmartReplyStats(userId: string): Promise<{ used: number; purchasedPacks: number }> {
  const supabase = getServiceClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('free_replies_used, purchased_reply_packs')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching smart reply stats:', error);
    return { used: 0, purchasedPacks: 0 };
  }

  return {
    used: profile?.free_replies_used || 0,
    purchasedPacks: profile?.purchased_reply_packs || 0,
  };
}

// Check smart reply free tier status (includes purchased packs)
export async function checkSmartReplyFreeTier(
  userId: string
): Promise<{ isFree: boolean; used: number; remaining: number; totalAllowed: number; needsPurchase: boolean }> {
  const stats = await getSmartReplyStats(userId);
  const totalAllowed = FREE_TIER.replies + (stats.purchasedPacks * FREE_TIER.repliesPerPack);
  const remaining = Math.max(0, totalAllowed - stats.used);
  const isFree = stats.used < FREE_TIER.replies; // Still within original free tier
  const needsPurchase = remaining === 0;

  return { isFree, used: stats.used, remaining, totalAllowed, needsPurchase };
}

// Check and deduct for smart reply (uses allowance system like edits)
export async function checkAndDeductSmartReplyCredits(
  userId: string
): Promise<{ success: true; newBalance: number; wasFree: boolean; remaining: number; needsPurchase?: boolean } | { success: false; error: string; needsPurchase?: boolean }> {
  const supabase = getServiceClient();

  // Check free tier + purchased packs
  const freeTierStatus = await checkSmartReplyFreeTier(userId);

  // If no replies remaining, tell user to purchase more
  if (freeTierStatus.needsPurchase) {
    // Get current credits to show in error
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
    const currentCredits = parseFloat(profile?.credits) || 0;

    return {
      success: false,
      error: `No replies remaining. Purchase a reply pack (5 replies for ${CREDIT_COSTS.reply_pack} credits) to continue.`,
      needsPurchase: true,
    };
  }

  // User has remaining replies (from free tier or purchased packs)
  // Increment usage counter
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ free_replies_used: freeTierStatus.used + 1 })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating free_replies_used:', updateError);
    return { success: false, error: 'Failed to update reply count' };
  }

  // Get current credits for response
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  const currentCredits = parseFloat(profile?.credits) || 0;
  return {
    success: true,
    newBalance: currentCredits,
    wasFree: freeTierStatus.isFree,
    remaining: freeTierStatus.remaining - 1,
  };
}

// Purchase a reply pack (5 replies for 0.10 credits)
export async function purchaseReplyPack(
  userId: string
): Promise<{ success: true; newBalance: number; newRemaining: number } | { success: false; error: string }> {
  const supabase = getServiceClient();
  const REPLY_PACK_COST = CREDIT_COSTS.reply_pack;
  const REPLIES_PER_PACK = FREE_TIER.repliesPerPack;

  // Get current credits and stats
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits, free_replies_used, purchased_reply_packs')
    .eq('id', userId)
    .single();

  if (fetchError) {
    return { success: false, error: 'Failed to check credits' };
  }

  const currentCredits = parseFloat(profile?.credits) || 0;

  if (currentCredits < REPLY_PACK_COST) {
    return {
      success: false,
      error: `Insufficient credits. You need ${REPLY_PACK_COST} credits but have ${currentCredits.toFixed(2)}`,
    };
  }

  // Deduct credits and increment purchased packs
  const newBalance = currentCredits - REPLY_PACK_COST;
  const newPacks = (profile?.purchased_reply_packs || 0) + 1;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: newBalance,
      purchased_reply_packs: newPacks,
    })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: 'Failed to purchase reply pack' };
  }

  // Calculate new remaining replies
  const used = profile?.free_replies_used || 0;
  const totalAllowed = FREE_TIER.replies + (newPacks * REPLIES_PER_PACK);
  const newRemaining = Math.max(0, totalAllowed - used);

  return { success: true, newBalance, newRemaining };
}

// Get total refinements used by user for a specific application
export async function getRefinementsUsedForApplication(userId: string, applicationId: string): Promise<number> {
  const supabase = getServiceClient();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('application_id', applicationId)
    .eq('action_type', 'refinement');

  if (error) {
    console.error('Error counting refinements:', error);
    return 0;
  }

  return count || 0;
}

// Check if refinement is free or within purchased allowance for this application
export async function checkFreeTier(
  userId: string,
  applicationId: string
): Promise<{ isFree: boolean; used: number; remaining: number; canEdit: boolean; needsPurchase: boolean }> {
  const supabase = getServiceClient();

  // Get edits used for this application
  const used = await getRefinementsUsedForApplication(userId, applicationId);

  // Get purchased edit packs for this application
  const { data: application } = await supabase
    .from('applications')
    .select('purchased_edit_packs')
    .eq('id', applicationId)
    .single();

  const purchasedPacks = application?.purchased_edit_packs || 0;
  const totalAllowed = FREE_TIER.refinements + (purchasedPacks * 5);
  const remaining = Math.max(0, totalAllowed - used);
  const isFree = used < FREE_TIER.refinements; // Still within free 5
  const canEdit = remaining > 0;
  const needsPurchase = !canEdit;

  return {
    isFree,
    used,
    remaining,
    canEdit,
    needsPurchase,
  };
}

// Purchase an edit pack (5 edits for 0.25 credits)
export async function purchaseEditPack(
  userId: string,
  applicationId: string
): Promise<{ success: true; newBalance: number; newRemaining: number } | { success: false; error: string }> {
  const supabase = getServiceClient();
  const EDIT_PACK_COST = 0.25;
  const EDITS_PER_PACK = 5;

  // Get current credits
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError) {
    return { success: false, error: 'Failed to check credits' };
  }

  const currentCredits = parseFloat(profile?.credits) || 0;

  if (currentCredits < EDIT_PACK_COST) {
    return {
      success: false,
      error: `Insufficient credits. You need ${EDIT_PACK_COST} credits but have ${currentCredits.toFixed(2)}`,
    };
  }

  // Verify user owns the application
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, purchased_edit_packs')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .single();

  if (appError || !application) {
    return { success: false, error: 'Application not found or access denied' };
  }

  // Deduct credits and increment purchased packs
  const newBalance = currentCredits - EDIT_PACK_COST;
  const newPacks = (application.purchased_edit_packs || 0) + 1;

  const { error: updateCreditsError } = await supabase
    .from('profiles')
    .update({ credits: newBalance })
    .eq('id', userId);

  if (updateCreditsError) {
    return { success: false, error: 'Failed to deduct credits' };
  }

  const { error: updateAppError } = await supabase
    .from('applications')
    .update({ purchased_edit_packs: newPacks })
    .eq('id', applicationId);

  if (updateAppError) {
    // Refund credits if app update failed
    await supabase.from('profiles').update({ credits: currentCredits }).eq('id', userId);
    return { success: false, error: 'Failed to add edit pack' };
  }

  // Calculate new remaining edits
  const used = await getRefinementsUsedForApplication(userId, applicationId);
  const totalAllowed = FREE_TIER.refinements + (newPacks * EDITS_PER_PACK);
  const newRemaining = Math.max(0, totalAllowed - used);

  return { success: true, newBalance, newRemaining };
}

// Check and deduct credits
export async function checkAndDeductCredits(
  userId: string,
  actionType: keyof typeof CREDIT_COSTS,
  applicationId?: string // Required for refinements to check per-application free tier
): Promise<{ success: true; newBalance: number; wasFree?: boolean; needsPurchase?: boolean } | { success: false; error: string; needsPurchase?: boolean }> {
  const supabase = getServiceClient();

  // Check if this is a refinement action that might be free or within purchased allowance
  const isRefinement = actionType === 'refine_bullet' || actionType === 'refine_cover';

  if (isRefinement && applicationId) {
    const freeTierStatus = await checkFreeTier(userId, applicationId);

    // If no edits remaining, tell user to purchase more
    if (freeTierStatus.needsPurchase) {
      return {
        success: false,
        error: 'No edits remaining. Purchase more edits to continue.',
        needsPurchase: true
      };
    }

    // If user can edit (has remaining from free or purchased packs), no credit deduction
    if (freeTierStatus.canEdit) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const currentCredits = parseFloat(profile?.credits) || 0;
      return { success: true, newBalance: currentCredits, wasFree: freeTierStatus.isFree };
    }
  }

  const cost = CREDIT_COSTS[actionType];

  // Get current credits
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching credits:', fetchError);
    return { success: false, error: 'Failed to check credits' };
  }

  const currentCredits = parseFloat(profile?.credits) || 0;

  if (currentCredits < cost) {
    return {
      success: false,
      error: `Insufficient credits. You need ${cost} credits but have ${currentCredits.toFixed(2)}`,
    };
  }

  // Deduct credits
  const newBalance = currentCredits - cost;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: newBalance })
    .eq('id', userId);

  if (updateError) {
    console.error('Error deducting credits:', updateError);
    return { success: false, error: 'Failed to deduct credits' };
  }

  return { success: true, newBalance };
}

// Refund credits (in case of error after deduction)
export async function refundCredits(
  userId: string,
  actionType: keyof typeof CREDIT_COSTS
): Promise<void> {
  const supabase = getServiceClient();
  const cost = CREDIT_COSTS[actionType];

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  const currentCredits = parseFloat(profile?.credits) || 0;

  await supabase
    .from('profiles')
    .update({ credits: currentCredits + cost })
    .eq('id', userId);
}

// Check rate limits
export async function checkRateLimit(
  userId: string,
  actionType: 'generation' | 'refinement'
): Promise<{ allowed: true } | { allowed: false; error: string; retryAfter?: number }> {
  const supabase = getServiceClient();
  const limits = RATE_LIMITS[actionType];
  const now = new Date();

  // Check hourly limit
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const { count: hourlyCount, error: hourlyError } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .gte('created_at', oneHourAgo.toISOString());

  if (hourlyError) {
    console.error('Rate limit check error:', hourlyError);
    // Fail open - allow the request if we can't check rate limits
    return { allowed: true };
  }

  if ((hourlyCount || 0) >= limits.per_hour) {
    // Find oldest request in the window to calculate retry time
    const { data: oldestRequest } = await supabase
      .from('rate_limits')
      .select('created_at')
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    const retryAfter = oldestRequest
      ? Math.ceil((new Date(oldestRequest.created_at).getTime() + 60 * 60 * 1000 - now.getTime()) / 1000 / 60)
      : 60;

    return {
      allowed: false,
      error: `Rate limit exceeded. You've reached ${limits.per_hour} ${actionType}s per hour. Try again in ${retryAfter} minutes.`,
      retryAfter: retryAfter * 60,
    };
  }

  // Check daily limit
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const { count: dailyCount } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .gte('created_at', oneDayAgo.toISOString());

  if ((dailyCount || 0) >= limits.per_day) {
    return {
      allowed: false,
      error: `Daily limit exceeded. You've reached ${limits.per_day} ${actionType}s per day. Try again tomorrow.`,
    };
  }

  return { allowed: true };
}

// Record rate limit usage
export async function recordRateLimitUsage(
  userId: string,
  actionType: 'generation' | 'refinement',
  applicationId?: string // Required for refinements to track per-application
): Promise<void> {
  const supabase = getServiceClient();

  await supabase.from('rate_limits').insert({
    user_id: userId,
    action_type: actionType,
    application_id: applicationId || null,
  });
}

// Validate job description input
export function validateJobDescription(text: string): { valid: true } | { valid: false; error: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Job description is required' };
  }

  const trimmed = text.trim();
  const { min, max } = INPUT_LIMITS.job_description;

  if (trimmed.length < min) {
    return { valid: false, error: `Job description must be at least ${min} characters` };
  }

  if (trimmed.length > max) {
    return { valid: false, error: `Job description must be less than ${max} characters` };
  }

  return { valid: true };
}

// Validate bullet point input
export function validateBullet(text: string): { valid: true } | { valid: false; error: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Bullet point is required' };
  }

  const trimmed = text.trim();
  const { min, max } = INPUT_LIMITS.bullet;

  if (trimmed.length < min) {
    return { valid: false, error: `Bullet point must be at least ${min} characters` };
  }

  if (trimmed.length > max) {
    return { valid: false, error: `Bullet point must be less than ${max} characters` };
  }

  return { valid: true };
}

// Validate cover letter input
export function validateCoverLetter(text: string): { valid: true } | { valid: false; error: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Cover letter is required' };
  }

  const trimmed = text.trim();
  const { min, max } = INPUT_LIMITS.cover_letter;

  if (trimmed.length < min) {
    return { valid: false, error: `Cover letter must be at least ${min} characters` };
  }

  if (trimmed.length > max) {
    return { valid: false, error: `Cover letter must be less than ${max} characters` };
  }

  return { valid: true };
}

// Sanitize text input (remove potential script injection)
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Verify user owns the application
export async function verifyApplicationOwnership(
  userId: string,
  applicationId: string
): Promise<{ valid: true; application: any } | { valid: false; error: string }> {
  const supabase = getServiceClient();

  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .single();

  if (error || !application) {
    return { valid: false, error: 'Application not found or access denied' };
  }

  return { valid: true, application };
}

// Create standard error response
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Create standard success response
export function successResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
