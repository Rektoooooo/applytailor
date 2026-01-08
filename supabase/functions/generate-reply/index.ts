// Smart Reply generation endpoint
// Cost: 0.1 credits per reply (after 3 free replies)

import { callClaude } from '../_shared/claude.ts';
import {
  corsHeaders,
  verifyAuth,
  checkRateLimit,
  recordRateLimitUsage,
  checkAndDeductSmartReplyCredits,
  checkSmartReplyFreeTier,
  sanitizeText,
  getServiceClient,
  errorResponse,
  successResponse,
  FREE_TIER,
  CREDIT_COSTS,
} from '../_shared/validation.ts';

interface GenerateReplyRequest {
  pasted_message: string;
  user_instructions?: string;
  application_id?: string;
  conversation_id?: string;
  message_type?: 'compose' | 'interview' | 'rejection' | 'follow_up' | 'offer' | 'other';
}

interface UserProfile {
  full_name?: string;
  email?: string;
}

interface BaseProfile {
  work_experience?: Array<{
    job_title?: string;
    company?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    graduation_year?: string;
    field?: string;
  }>;
  skills?: {
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
  };
  links?: {
    linkedin?: string;
    portfolio?: string;
    github?: string;
    website?: string;
  };
  achievements?: string[];
}

// Message type detection keywords
const MESSAGE_TYPE_KEYWORDS = {
  interview: ['interview', 'schedule', 'meet', 'call', 'available', 'availability', 'slot', 'zoom', 'teams', 'video call'],
  rejection: ['unfortunately', 'regret', 'not moving forward', 'not selected', 'other candidates', 'not successful', 'declined'],
  offer: ['offer', 'pleased to offer', 'compensation', 'salary', 'start date', 'package', 'benefits'],
  follow_up: ['update', 'checking in', 'status', 'where are we', 'any news', 'hear back'],
};

function detectMessageType(message: string): string {
  const lowerMessage = message.toLowerCase();

  for (const [type, keywords] of Object.entries(MESSAGE_TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return type;
    }
  }

  return 'other';
}

function buildSystemPrompt(messageType: string): string {
  // Compose mode has a completely different prompt
  if (messageType === 'compose') {
    return `You are writing an outreach email for a job seeker.

OUTPUT FORMAT (MUST FOLLOW EXACTLY):
First output a subject line, then "---", then the email body.

Example format:
Zájem o spolupráci - Jan Novák, Software Developer
---
Dobrý den,

[email body here]

S pozdravem,
Jan Novák

ABSOLUTE RULES:

1. SUBJECT LINE: Short, professional, include sender's name and purpose. No "Subject:" prefix.

2. GREETING: Start email body with proper greeting like "Dobrý den," or "Dear Hiring Team,"

3. LANGUAGE: Match the user's request language exactly.

4. USE ONLY REAL PROFILE DATA:
   - If profile says "Sender's Name: Jan Novák" → use "Jan Novák"
   - If profile says "Portfolio: mysite.com" → use exactly "mysite.com"
   - If profile says "Key Skills: React, Python" → only mention those skills
   - If something is NOT in the profile → DO NOT MENTION IT

5. ABSOLUTELY FORBIDDEN:
   - [BRACKETS] or [PLACEHOLDERS] of any kind
   - Made-up URLs or skills
   - Any preamble before the subject line
   - "I hope this finds you well"`;
  }

  const basePrompt = `You are a professional career assistant helping job seekers respond to application-related emails.

IMPORTANT: Detect the language of the incoming message and respond in THE SAME LANGUAGE. If the message is in German, reply in German. If in French, reply in French. Match the language exactly.

Generate a complete, ready-to-send reply that is:
- Professional but warm in tone
- Concise (2-4 paragraphs max)
- Directly addresses points in the original message
- Appropriate for the message type
- In the SAME LANGUAGE as the original message

Do NOT include:
- Subject lines
- Email headers
- Placeholder text like [Your Name] - leave those for the user to fill
- Explanations or meta-commentary

Just output the reply text directly.`;

  const typeSpecificGuidance = {
    interview: 'Express enthusiasm about the opportunity. Confirm interest and show flexibility with scheduling. Ask any clarifying questions about the format or preparation.',
    rejection: 'Thank them graciously for considering you. Express continued interest in future opportunities. Keep it brief and professional - no need to ask for feedback.',
    offer: 'Express enthusiasm and gratitude. If appropriate, indicate you need time to review. Be professional about any questions or negotiations.',
    follow_up: 'Respond helpfully to their query. Be concise and professional. Address any specific questions they asked.',
    other: 'Respond appropriately to the context. Be professional and helpful.',
  };

  return `${basePrompt}\n\nFor this ${messageType} message: ${typeSpecificGuidance[messageType as keyof typeof typeSpecificGuidance] || typeSpecificGuidance.other}`;
}

function formatProfileContext(userProfile: UserProfile | null, baseProfile: BaseProfile | null): string {
  const parts: string[] = [];

  // User's name from profiles table
  if (userProfile?.full_name) {
    parts.push(`Sender's Name: ${userProfile.full_name}`);
  }

  if (userProfile?.email) {
    parts.push(`Email: ${userProfile.email}`);
  }

  // Work experience
  if (baseProfile?.work_experience && baseProfile.work_experience.length > 0) {
    const recentExperience = baseProfile.work_experience.slice(0, 3);
    const expText = recentExperience.map(exp => {
      const role = exp.job_title || 'Role';
      const company = exp.company || 'Company';
      const period = exp.end_date ? `${exp.start_date || ''} - ${exp.end_date}` : `${exp.start_date || ''} - Present`;
      const desc = exp.description ? ` - ${exp.description.substring(0, 150)}` : '';
      return `• ${role} at ${company} (${period})${desc}`;
    }).join('\n');
    parts.push(`Work Experience:\n${expText}`);
  }

  // Skills - flatten the object structure
  if (baseProfile?.skills) {
    const allSkills: string[] = [];
    if (baseProfile.skills.languages?.length) allSkills.push(...baseProfile.skills.languages);
    if (baseProfile.skills.frameworks?.length) allSkills.push(...baseProfile.skills.frameworks);
    if (baseProfile.skills.tools?.length) allSkills.push(...baseProfile.skills.tools);
    if (allSkills.length > 0) {
      parts.push(`Key Skills: ${allSkills.slice(0, 20).join(', ')}`);
    }
  }

  // Education
  if (baseProfile?.education && baseProfile.education.length > 0) {
    const edu = baseProfile.education[0];
    const eduText = [edu.degree, edu.field, edu.school, edu.graduation_year].filter(Boolean).join(', ');
    if (eduText) parts.push(`Education: ${eduText}`);
  }

  // Links
  if (baseProfile?.links) {
    if (baseProfile.links.linkedin) {
      parts.push(`LinkedIn: ${baseProfile.links.linkedin}`);
    }
    if (baseProfile.links.portfolio) {
      parts.push(`Portfolio: ${baseProfile.links.portfolio}`);
    }
    if (baseProfile.links.github) {
      parts.push(`GitHub: ${baseProfile.links.github}`);
    }
    if (baseProfile.links.website) {
      parts.push(`Website: ${baseProfile.links.website}`);
    }
  }

  // Achievements
  if (baseProfile?.achievements && baseProfile.achievements.length > 0) {
    parts.push(`Key Achievements: ${baseProfile.achievements.slice(0, 3).join('; ')}`);
  }

  return parts.join('\n');
}

function buildUserPrompt(
  pastedMessage: string,
  userInstructions: string | undefined,
  applicationContext: { company?: string; jobTitle?: string } | null,
  messageType: string,
  profileContext: string | null
): string {
  // Compose mode - user is writing an outreach email
  if (messageType === 'compose') {
    let prompt = `User's request: ${pastedMessage}\n`;

    if (profileContext) {
      prompt += `\n=== SENDER'S ACTUAL PROFILE (use ONLY this data, don't invent) ===\n${profileContext}\n=== END PROFILE ===\n`;
    } else {
      prompt += `\n[No profile data available - keep the email generic]\n`;
    }

    if (applicationContext?.company || applicationContext?.jobTitle) {
      prompt += `\nTarget company/role: ${applicationContext.jobTitle || ''} at ${applicationContext.company || ''}\n`;
    }

    if (userInstructions) {
      prompt += `\nAdditional instructions: ${userInstructions}\n`;
    }

    prompt += '\nWrite the email now (start with greeting, no preamble):';
    return prompt;
  }

  // Standard reply mode
  let prompt = `Message received:\n---\n${pastedMessage}\n---\n`;

  if (applicationContext?.company || applicationContext?.jobTitle) {
    prompt += `\nContext: This is regarding the ${applicationContext.jobTitle || 'position'} role at ${applicationContext.company || 'the company'}.\n`;
  }

  if (userInstructions) {
    prompt += `\nUser's specific instructions: ${userInstructions}\n`;
  }

  prompt += '\nGenerate a professional reply:';

  return prompt;
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
  let body: GenerateReplyRequest;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate inputs
  if (!body.pasted_message || body.pasted_message.trim().length < 20) {
    return errorResponse('Message must be at least 20 characters');
  }

  if (body.pasted_message.length > 10000) {
    return errorResponse('Message must be less than 10,000 characters');
  }

  // Sanitize inputs
  const pastedMessage = sanitizeText(body.pasted_message);
  const userInstructions = body.user_instructions ? sanitizeText(body.user_instructions) : undefined;

  // Check and deduct credits
  const creditResult = await checkAndDeductSmartReplyCredits(userId);
  if (!creditResult.success) {
    return errorResponse(creditResult.error, 402);
  }

  const supabase = getServiceClient();

  try {
    // Get application context if provided
    let applicationContext: { company?: string; jobTitle?: string } | null = null;
    if (body.application_id) {
      const { data: application } = await supabase
        .from('applications')
        .select('company, role')
        .eq('id', body.application_id)
        .eq('user_id', userId)
        .single();

      if (application) {
        applicationContext = {
          company: application.company,
          jobTitle: application.role,
        };
      }
    }

    // Check if this is a follow-up to an existing conversation
    let existingConversation: { message_type: string; application_id: string | null } | null = null;
    let previousEmail: string | null = null;

    if (body.conversation_id) {
      // Get the existing conversation's message type
      const { data: conv } = await supabase
        .from('conversations')
        .select('message_type, application_id')
        .eq('id', body.conversation_id)
        .eq('user_id', userId)
        .single();

      if (conv) {
        existingConversation = conv;

        // For compose rewrites, get the last generated email
        if (conv.message_type === 'compose') {
          const { data: lastMessage } = await supabase
            .from('conversation_messages')
            .select('content')
            .eq('conversation_id', body.conversation_id)
            .eq('role', 'assistant')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastMessage) {
            previousEmail = lastMessage.content;
          }
        }
      }
    }

    // Detect or use provided message type (use existing conversation's type if available)
    const messageType = existingConversation?.message_type || body.message_type || detectMessageType(pastedMessage);
    const isComposeRewrite = messageType === 'compose' && previousEmail;

    // Fetch user profile for compose mode
    let profileContext: string | null = null;
    if (messageType === 'compose') {
      // Fetch from profiles table (name, email)
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      // Fetch from base_profiles table (experience, skills, links)
      const { data: baseProfile, error: baseProfileError } = await supabase
        .from('base_profiles')
        .select('work_experience, education, skills, links, achievements')
        .eq('user_id', userId)
        .single();

      console.log('Profile fetch results:', {
        userProfile: userProfile ? JSON.stringify(userProfile) : 'not found',
        userProfileError: userProfileError?.message,
        baseProfile: baseProfile ? 'found' : 'not found',
        baseProfileError: baseProfileError?.message,
        baseProfileLinks: baseProfile?.links ? JSON.stringify(baseProfile.links) : 'no links',
        baseProfileSkills: baseProfile?.skills ? JSON.stringify(baseProfile.skills) : 'no skills',
      });

      profileContext = formatProfileContext(
        userProfile as UserProfile | null,
        baseProfile as BaseProfile | null
      );
      console.log('Formatted profile context:', profileContext);
    }

    // Build prompts
    let systemPrompt: string;
    let userPrompt: string;

    if (isComposeRewrite) {
      // Special prompt for rewriting an existing compose email
      systemPrompt = `You are a professional career assistant helping rewrite outreach emails.

CRITICAL RULES:
1. LANGUAGE: Keep the same language as the original email unless asked to change it.
2. NO PLACEHOLDERS: NEVER use placeholder brackets like [Your Name], [Company], etc. Use actual information.
3. PRESERVE INTENT: Keep the core purpose of the email while applying the requested changes.

Rewrite the email according to the user's instructions. Output only the rewritten email, no explanations.`;

      userPrompt = `Here is the current email draft:

---
${previousEmail}
---

User's request for changes: ${pastedMessage}
${userInstructions ? `\nAdditional instructions: ${userInstructions}` : ''}
${profileContext ? `\n--- Sender's Profile (use if needed) ---\n${profileContext}\n---` : ''}

Rewrite the email with the requested changes:`;
    } else {
      systemPrompt = buildSystemPrompt(messageType);
      userPrompt = buildUserPrompt(pastedMessage, userInstructions, applicationContext, messageType, profileContext);
    }

    // Call Claude
    const claudeResult = await callClaude(
      systemPrompt,
      [{ role: 'user', content: userPrompt }],
      1024
    );

    if (!claudeResult.success) {
      // Note: We don't refund for smart reply since we use a different tracking mechanism
      return errorResponse('AI generation failed. Please try again.', 503);
    }

    const generatedReply = claudeResult.data.content[0]?.text?.trim() || '';

    if (!generatedReply || generatedReply.length < 20) {
      return errorResponse('AI returned an invalid response. Please try again.', 503);
    }

    // Create or update conversation
    let conversationId = body.conversation_id;

    if (!conversationId) {
      // Create new conversation
      let title: string;
      if (messageType === 'compose') {
        title = applicationContext?.company
          ? `Email to ${applicationContext.company}`
          : 'Outreach Email';
      } else {
        title = applicationContext?.company
          ? `${messageType.charAt(0).toUpperCase() + messageType.slice(1).replace('_', ' ')} - ${applicationContext.company}`
          : `${messageType.charAt(0).toUpperCase() + messageType.slice(1).replace('_', ' ')} Response`;
      }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          application_id: body.application_id || null,
          title,
          message_type: messageType,
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return errorResponse('Failed to save conversation', 500);
      }

      conversationId = conversation.id;
    } else {
      // Update existing conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    // Save the pasted message
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'pasted',
      content: pastedMessage,
    });

    // Save user instructions if provided
    if (userInstructions) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role: 'instruction',
        content: userInstructions,
      });
    }

    // For compose mode, split subject and body
    let subjectLine: string | null = null;
    let emailBody = generatedReply;

    if (messageType === 'compose' && generatedReply.includes('---')) {
      const parts = generatedReply.split('---');
      if (parts.length >= 2) {
        subjectLine = parts[0].trim();
        emailBody = parts.slice(1).join('---').trim();
      }
    }

    // Save subject line as separate message for compose mode
    if (subjectLine) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role: 'subject',
        content: subjectLine,
      });
    }

    // Save the generated reply/email body
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: emailBody,
      credits_used: creditResult.wasFree ? 0 : CREDIT_COSTS.smart_reply,
    });

    // Record rate limit usage
    await recordRateLimitUsage(userId, 'refinement');

    // Get updated free tier status
    const freeTierStatus = await checkSmartReplyFreeTier(userId);

    // Return success
    return successResponse({
      conversation_id: conversationId,
      reply: generatedReply,
      message_type: messageType,
      credits_remaining: creditResult.newBalance,
      was_free: creditResult.wasFree,
      free_tier: {
        remaining: freeTierStatus.remaining,
        total: freeTierStatus.totalAllowed,
        used: freeTierStatus.used,
        needs_purchase: freeTierStatus.needsPurchase,
        initial_free: FREE_TIER.replies,
      },
      pack_info: {
        cost: CREDIT_COSTS.reply_pack,
        replies_per_pack: FREE_TIER.repliesPerPack,
      },
    });
  } catch (error) {
    console.error('Generate reply error:', error);
    return errorResponse('Reply generation failed unexpectedly. Please try again.', 500);
  }
});
