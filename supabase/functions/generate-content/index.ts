// Main CV/Cover Letter generation endpoint
// Cost: 1 credit per generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { callClaude, parseJsonResponse } from '../_shared/claude.ts';
import { MAIN_GENERATION_PROMPT, buildGenerationPrompt } from '../_shared/prompts.ts';
import {
  corsHeaders,
  verifyAuth,
  checkRateLimit,
  recordRateLimitUsage,
  checkAndDeductCredits,
  refundCredits,
  validateJobDescription,
  sanitizeText,
  errorResponse,
  successResponse,
} from '../_shared/validation.ts';

interface GenerationRequest {
  job_description: string;
  company_name?: string;
  job_title?: string;
  profile: {
    personal_info?: { name?: string; title?: string };
    professional_summary?: string;
    work_experience?: Array<{
      company?: string;
      title?: string;
      bullets?: string[];
    }>;
    skills?: string[];
    education?: Array<{
      institution?: string;
      degree?: string;
      field?: string;
    }>;
  };
}

interface GenerationResponse {
  tailored_bullets: Array<{
    original: string;
    tailored: string;
    keywords_matched: string[];
  }>;
  cover_letter: string;
  professional_summary: string;
  keyword_analysis: {
    matched: string[];
    missing: string[];
    weak: string[];
  };
  match_score: number;
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
  const rateLimitResult = await checkRateLimit(userId, 'generation');
  if (!rateLimitResult.allowed) {
    const response = errorResponse(rateLimitResult.error, 429);
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
    return response;
  }

  // Parse and validate request body
  let body: GenerationRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate job description
  const jobValidation = validateJobDescription(body.job_description);
  if (!jobValidation.valid) {
    return errorResponse(jobValidation.error);
  }

  // Sanitize inputs
  const jobDescription = sanitizeText(body.job_description);
  const companyName = body.company_name ? sanitizeText(body.company_name) : undefined;
  const jobTitle = body.job_title ? sanitizeText(body.job_title) : undefined;

  // Check profile has some content
  if (!body.profile || (!body.profile.work_experience?.length && !body.profile.skills?.length)) {
    return errorResponse('Profile must include work experience or skills');
  }

  // Check and deduct credits
  const creditResult = await checkAndDeductCredits(userId, 'generation');
  if (!creditResult.success) {
    return errorResponse(creditResult.error, 402);
  }

  try {
    // Build the user prompt
    const userPrompt = buildGenerationPrompt(
      jobDescription,
      body.profile,
      companyName,
      jobTitle
    );

    // Call Claude
    const claudeResult = await callClaude(
      MAIN_GENERATION_PROMPT,
      [{ role: 'user', content: userPrompt }],
      2048
    );

    if (!claudeResult.success) {
      // Refund credits on API failure
      await refundCredits(userId, 'generation');
      return errorResponse('AI generation failed. Please try again.', 503);
    }

    // Parse the response
    const responseText = claudeResult.data.content[0]?.text || '';
    const parseResult = parseJsonResponse<GenerationResponse>(responseText);

    if (!parseResult.success) {
      // Refund credits on parse failure
      await refundCredits(userId, 'generation');
      console.error('Failed to parse Claude response:', responseText.slice(0, 500));
      return errorResponse('AI response was invalid. Please try again.', 503);
    }

    // Validate the response structure
    const generated = parseResult.data;
    if (
      !generated.tailored_bullets ||
      !Array.isArray(generated.tailored_bullets) ||
      !generated.cover_letter ||
      !generated.keyword_analysis
    ) {
      await refundCredits(userId, 'generation');
      return errorResponse('AI response was incomplete. Please try again.', 503);
    }

    // Record rate limit usage
    await recordRateLimitUsage(userId, 'generation');

    // Return success with generated content
    return successResponse({
      ...generated,
      credits_remaining: creditResult.newBalance,
      tokens_used: {
        input: claudeResult.data.usage.input_tokens,
        output: claudeResult.data.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    // Refund credits on any error
    await refundCredits(userId, 'generation');
    return errorResponse('Generation failed unexpectedly. Please try again.', 500);
  }
});
