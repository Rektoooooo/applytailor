// Bullet point refinement endpoint
// Cost: 0.25 credits per refinement

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { callClaude } from '../_shared/claude.ts';
import { BULLET_REFINEMENT_PROMPTS, buildBulletRefinementContext } from '../_shared/prompts.ts';
import {
  corsHeaders,
  verifyAuth,
  checkRateLimit,
  recordRateLimitUsage,
  checkAndDeductCredits,
  refundCredits,
  validateBullet,
  sanitizeText,
  verifyApplicationOwnership,
  errorResponse,
  successResponse,
} from '../_shared/validation.ts';

interface RefineBulletRequest {
  application_id: string;
  bullet: string;
  refinement_type: 'shorter' | 'add_metrics' | 'rephrase';
  job_context?: string; // Optional job description for context
}

serve(async (req) => {
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

  // Check rate limit
  const rateLimitResult = await checkRateLimit(userId, 'refinement');
  if (!rateLimitResult.allowed) {
    const response = errorResponse(rateLimitResult.error, 429);
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
    return response;
  }

  // Parse request body
  let body: RefineBulletRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate inputs
  if (!body.application_id) {
    return errorResponse('Application ID is required');
  }

  const bulletValidation = validateBullet(body.bullet);
  if (!bulletValidation.valid) {
    return errorResponse(bulletValidation.error);
  }

  if (!body.refinement_type || !['shorter', 'add_metrics', 'rephrase'].includes(body.refinement_type)) {
    return errorResponse('Invalid refinement type. Must be: shorter, add_metrics, or rephrase');
  }

  // Verify user owns the application
  const ownershipResult = await verifyApplicationOwnership(userId, body.application_id);
  if (!ownershipResult.valid) {
    return errorResponse(ownershipResult.error, 403);
  }

  // Sanitize inputs
  const bullet = sanitizeText(body.bullet);
  const jobContext = body.job_context ? sanitizeText(body.job_context) : undefined;

  // Check and deduct credits
  const creditResult = await checkAndDeductCredits(userId, 'refine_bullet');
  if (!creditResult.success) {
    return errorResponse(creditResult.error, 402);
  }

  try {
    // Get the system prompt for this refinement type
    const systemPrompt = BULLET_REFINEMENT_PROMPTS[body.refinement_type];

    // Build user prompt with context
    const userPrompt = buildBulletRefinementContext(bullet, jobContext, body.refinement_type);

    // Call Claude
    const claudeResult = await callClaude(
      systemPrompt,
      [{ role: 'user', content: userPrompt }],
      256 // Short response needed for single bullet
    );

    if (!claudeResult.success) {
      await refundCredits(userId, 'refine_bullet');
      return errorResponse('AI refinement failed. Please try again.', 503);
    }

    // Get the refined bullet (plain text, not JSON)
    const refinedBullet = claudeResult.data.content[0]?.text?.trim() || '';

    if (!refinedBullet || refinedBullet.length < 10) {
      await refundCredits(userId, 'refine_bullet');
      return errorResponse('AI returned an invalid response. Please try again.', 503);
    }

    // Record rate limit usage
    await recordRateLimitUsage(userId, 'refinement');

    // Return success with refined bullet
    return successResponse({
      original: bullet,
      refined: refinedBullet,
      refinement_type: body.refinement_type,
      credits_remaining: creditResult.newBalance,
    });
  } catch (error) {
    console.error('Refinement error:', error);
    await refundCredits(userId, 'refine_bullet');
    return errorResponse('Refinement failed unexpectedly. Please try again.', 500);
  }
});
