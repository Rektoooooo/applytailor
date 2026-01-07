// Check remaining free smart replies for a user
// Returns the free tier status for smart replies

import {
  corsHeaders,
  verifyAuth,
  checkSmartReplyFreeTier,
  errorResponse,
  successResponse,
  FREE_TIER,
  CREDIT_COSTS,
} from '../_shared/validation.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Verify authentication
  let authResult;
  try {
    authResult = await verifyAuth(req);
  } catch (authError) {
    console.error('Auth exception:', authError);
    return errorResponse(`Auth crashed: ${authError.message}`, 401);
  }

  if ('error' in authResult) {
    console.error('Auth failed:', authResult.error);
    return errorResponse(authResult.error, 401);
  }
  const { userId } = authResult;
  console.log('Auth success for user:', userId);

  // Get free tier status
  const freeTierStatus = await checkSmartReplyFreeTier(userId);

  // Return success with free tier info
  return successResponse({
    free_tier: {
      remaining: freeTierStatus.remaining,
      total: FREE_TIER.replies,
      used: freeTierStatus.used,
      has_free: freeTierStatus.isFree,
    },
    credit_cost: CREDIT_COSTS.smart_reply,
  });
});
