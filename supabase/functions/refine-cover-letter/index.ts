// Cover letter refinement endpoint
// Cost: 0.25 credits for shorter, 0.5 credits for regenerate

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { callClaude } from '../_shared/claude.ts';
import { COVER_LETTER_REFINEMENT_PROMPTS, buildCoverLetterRefinementContext } from '../_shared/prompts.ts';
import {
  corsHeaders,
  verifyAuth,
  checkRateLimit,
  recordRateLimitUsage,
  checkAndDeductCredits,
  checkFreeTier,
  refundCredits,
  validateCoverLetter,
  sanitizeText,
  verifyApplicationOwnership,
  errorResponse,
  successResponse,
  FREE_TIER,
} from '../_shared/validation.ts';

interface RefineCoverLetterRequest {
  application_id: string;
  cover_letter: string;
  refinement_type: 'shorter' | 'regenerate';
  job_description?: string; // Required for regenerate
  candidate_name?: string;
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
  let body: RefineCoverLetterRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate inputs
  if (!body.application_id) {
    return errorResponse('Application ID is required');
  }

  const coverLetterValidation = validateCoverLetter(body.cover_letter);
  if (!coverLetterValidation.valid) {
    return errorResponse(coverLetterValidation.error);
  }

  if (!body.refinement_type || !['shorter', 'regenerate'].includes(body.refinement_type)) {
    return errorResponse('Invalid refinement type. Must be: shorter or regenerate');
  }

  // For regenerate, job description is required
  if (body.refinement_type === 'regenerate' && !body.job_description) {
    return errorResponse('Job description is required for regeneration');
  }

  // Verify user owns the application
  const ownershipResult = await verifyApplicationOwnership(userId, body.application_id);
  if (!ownershipResult.valid) {
    return errorResponse(ownershipResult.error, 403);
  }

  // Sanitize inputs
  const coverLetter = sanitizeText(body.cover_letter);
  const jobDescription = body.job_description ? sanitizeText(body.job_description) : undefined;
  const candidateName = body.candidate_name ? sanitizeText(body.candidate_name) : undefined;

  // Determine credit cost based on refinement type
  const creditAction = body.refinement_type === 'regenerate' ? 'regenerate_cover' : 'refine_cover';

  // Check and deduct credits
  const creditResult = await checkAndDeductCredits(userId, creditAction);
  if (!creditResult.success) {
    return errorResponse(creditResult.error, 402);
  }

  try {
    // Get the system prompt for this refinement type
    const systemPrompt = COVER_LETTER_REFINEMENT_PROMPTS[body.refinement_type];

    // Build user prompt with context
    const userPrompt = buildCoverLetterRefinementContext(
      coverLetter,
      jobDescription,
      candidateName,
      body.refinement_type
    );

    // Call Claude
    const claudeResult = await callClaude(
      systemPrompt,
      [{ role: 'user', content: userPrompt }],
      512 // Cover letters need more tokens than bullets
    );

    if (!claudeResult.success) {
      await refundCredits(userId, creditAction);
      return errorResponse('AI refinement failed. Please try again.', 503);
    }

    // Get the refined cover letter (plain text, not JSON)
    const refinedCoverLetter = claudeResult.data.content[0]?.text?.trim() || '';

    if (!refinedCoverLetter || refinedCoverLetter.length < 50) {
      await refundCredits(userId, creditAction);
      return errorResponse('AI returned an invalid response. Please try again.', 503);
    }

    // Record rate limit usage
    await recordRateLimitUsage(userId, 'refinement');

    // Get updated free tier status (after recording usage)
    const freeTierStatus = await checkFreeTier(userId);

    // Return success with refined cover letter
    return successResponse({
      original: coverLetter,
      refined: refinedCoverLetter,
      refinement_type: body.refinement_type,
      credits_remaining: creditResult.newBalance,
      was_free: creditResult.wasFree || false,
      free_tier: {
        remaining: freeTierStatus.remaining,
        total: FREE_TIER.refinements,
        used: freeTierStatus.used,
      },
    });
  } catch (error) {
    console.error('Refinement error:', error);
    await refundCredits(userId, creditAction);
    return errorResponse('Refinement failed unexpectedly. Please try again.', 500);
  }
});
