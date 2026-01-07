// Check remaining edits for an application
// Returns the free tier status for a specific application

import {
  corsHeaders,
  verifyAuth,
  checkFreeTier,
  verifyApplicationOwnership,
  errorResponse,
  successResponse,
  FREE_TIER,
} from '../_shared/validation.ts';

interface CheckEditsRequest {
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
  let body: CheckEditsRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate inputs
  if (!body.application_id) {
    return errorResponse('Application ID is required');
  }

  // Verify user owns the application
  const ownershipResult = await verifyApplicationOwnership(userId, body.application_id);
  if (!ownershipResult.valid) {
    return errorResponse(ownershipResult.error, 403);
  }

  // Get free tier status
  const freeTierStatus = await checkFreeTier(userId, body.application_id);

  // Return success with free tier info
  return successResponse({
    free_tier: {
      remaining: freeTierStatus.remaining,
      total: FREE_TIER.refinements,
      used: freeTierStatus.used,
      can_edit: freeTierStatus.canEdit,
      needs_purchase: freeTierStatus.needsPurchase,
    },
  });
});
