// AI API client for CV generation and refinement
import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get authorization headers for edge function calls
 */
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

/**
 * Call a Supabase edge function
 */
async function callEdgeFunction(functionName, body) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle specific error codes
    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }
    if (response.status === 402) {
      throw new Error(data.error || 'Insufficient credits. Please top up to continue.');
    }
    if (response.status === 429) {
      throw new Error(data.error || 'Too many requests. Please wait and try again.');
    }
    throw new Error(data.error || 'An error occurred. Please try again.');
  }

  return data;
}

/**
 * Generate tailored CV content, cover letter, and keyword analysis
 * Cost: 1 credit
 */
export async function generateContent({
  jobDescription,
  companyName,
  jobTitle,
  profile,
}) {
  return callEdgeFunction('generate-content', {
    job_description: jobDescription,
    company_name: companyName,
    job_title: jobTitle,
    profile,
  });
}

/**
 * Refine a single bullet point
 * Cost: 0.25 credits
 *
 * @param refinementType - 'shorter' | 'add_metrics' | 'rephrase'
 */
export async function refineBullet({
  applicationId,
  bullet,
  refinementType,
  jobContext,
}) {
  return callEdgeFunction('refine-bullet', {
    application_id: applicationId,
    bullet,
    refinement_type: refinementType,
    job_context: jobContext,
  });
}

/**
 * Refine cover letter
 * Cost: 0.25 credits for 'shorter', 0.5 credits for 'regenerate'
 *
 * @param refinementType - 'shorter' | 'regenerate'
 */
export async function refineCoverLetter({
  applicationId,
  coverLetter,
  refinementType,
  jobDescription,
  candidateName,
}) {
  return callEdgeFunction('refine-cover-letter', {
    application_id: applicationId,
    cover_letter: coverLetter,
    refinement_type: refinementType,
    job_description: jobDescription,
    candidate_name: candidateName,
  });
}

// Credit costs for display purposes
export const CREDIT_COSTS = {
  generation: 1.0,
  regenerate_bullets: 0.5,
  regenerate_cover: 0.5,
  refine_bullet: 0.5,  // After free tier
  refine_cover: 0.5,   // After free tier
};

// Free tier configuration
export const FREE_TIER = {
  refinements: 5,  // First 5 refinements are free
};
