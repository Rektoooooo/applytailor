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
};

// Free tier configuration
export const FREE_TIER = {
  refinements: 5,  // First 5 refinements are free
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
      Deno.env.get('SUPABASE_ANON_KEY') as string
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { error: 'Invalid token' };
    }

    return { userId: user.id };
  } catch (error) {
    return { error: 'Authentication failed' };
  }
}

// Get total refinements used by user (all time)
export async function getTotalRefinementsUsed(userId: string): Promise<number> {
  const supabase = getServiceClient();

  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'refinement');

  if (error) {
    console.error('Error counting refinements:', error);
    return 0;
  }

  return count || 0;
}

// Check if refinement is free (within free tier)
export async function checkFreeTier(
  userId: string
): Promise<{ isFree: boolean; used: number; remaining: number }> {
  const used = await getTotalRefinementsUsed(userId);
  const remaining = Math.max(0, FREE_TIER.refinements - used);

  return {
    isFree: used < FREE_TIER.refinements,
    used,
    remaining,
  };
}

// Check and deduct credits
export async function checkAndDeductCredits(
  userId: string,
  actionType: keyof typeof CREDIT_COSTS
): Promise<{ success: true; newBalance: number; wasFree?: boolean } | { success: false; error: string }> {
  const supabase = getServiceClient();

  // Check if this is a refinement action that might be free
  const isRefinement = actionType === 'refine_bullet' || actionType === 'refine_cover';

  if (isRefinement) {
    const freeTierStatus = await checkFreeTier(userId);

    if (freeTierStatus.isFree) {
      // Get current balance to return (no deduction)
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const currentCredits = parseFloat(profile?.credits) || 0;
      return { success: true, newBalance: currentCredits, wasFree: true };
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
  actionType: 'generation' | 'refinement'
): Promise<void> {
  const supabase = getServiceClient();

  await supabase.from('rate_limits').insert({
    user_id: userId,
    action_type: actionType,
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
