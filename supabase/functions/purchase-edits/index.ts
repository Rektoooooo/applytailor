// Purchase edit pack endpoint
// Cost: 0.25 credits for 5 edits

import {
  corsHeaders,
  verifyAuth,
  purchaseEditPack,
  checkFreeTier,
  errorResponse,
  successResponse,
  FREE_TIER,
} from '../_shared/validation.ts';

interface PurchaseEditsRequest {
  application_id: string;
}

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
  const authResult = await verifyAuth(req);
  if ('error' in authResult) {
    return errorResponse(authResult.error, 401);
  }
  const { userId } = authResult;

  // Parse request body
  let body: PurchaseEditsRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate inputs
  if (!body.application_id) {
    return errorResponse('Application ID is required');
  }

  // Purchase the edit pack
  const result = await purchaseEditPack(userId, body.application_id);

  if (!result.success) {
    return errorResponse(result.error, 402);
  }

  // Get updated free tier status
  const freeTierStatus = await checkFreeTier(userId, body.application_id);

  // Return success
  return successResponse({
    success: true,
    credits_remaining: result.newBalance,
    edits_remaining: result.newRemaining,
    free_tier: {
      remaining: freeTierStatus.remaining,
      total: FREE_TIER.refinements,
      used: freeTierStatus.used,
      canEdit: freeTierStatus.canEdit,
    },
  });
});
