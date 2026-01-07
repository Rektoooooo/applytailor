// Purchase reply pack endpoint
// Cost: 0.10 credits for 5 replies

import {
  corsHeaders,
  verifyAuth,
  purchaseReplyPack,
  checkSmartReplyFreeTier,
  errorResponse,
  successResponse,
  CREDIT_COSTS,
  FREE_TIER,
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

  // Purchase the reply pack
  const purchaseResult = await purchaseReplyPack(userId);

  if (!purchaseResult.success) {
    return errorResponse(purchaseResult.error, 402);
  }

  // Get updated free tier status
  const freeTierStatus = await checkSmartReplyFreeTier(userId);

  // Return success
  return successResponse({
    success: true,
    credits_remaining: purchaseResult.newBalance,
    replies_remaining: purchaseResult.newRemaining,
    free_tier: {
      remaining: freeTierStatus.remaining,
      total: freeTierStatus.totalAllowed,
      used: freeTierStatus.used,
    },
    pack_info: {
      cost: CREDIT_COSTS.reply_pack,
      replies_per_pack: FREE_TIER.repliesPerPack,
    },
  });
});
