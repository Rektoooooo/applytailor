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
  message_type?: 'interview' | 'rejection' | 'follow_up' | 'offer' | 'other';
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

function buildUserPrompt(
  pastedMessage: string,
  userInstructions: string | undefined,
  applicationContext: { company?: string; jobTitle?: string } | null
): string {
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

    // Detect or use provided message type
    const messageType = body.message_type || detectMessageType(pastedMessage);

    // Build prompts
    const systemPrompt = buildSystemPrompt(messageType);
    const userPrompt = buildUserPrompt(pastedMessage, userInstructions, applicationContext);

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
      const title = applicationContext?.company
        ? `${messageType.charAt(0).toUpperCase() + messageType.slice(1).replace('_', ' ')} - ${applicationContext.company}`
        : `${messageType.charAt(0).toUpperCase() + messageType.slice(1).replace('_', ' ')} Response`;

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

    // Save the generated reply
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: generatedReply,
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
        total: FREE_TIER.replies,
        used: freeTierStatus.used,
      },
    });
  } catch (error) {
    console.error('Generate reply error:', error);
    return errorResponse('Reply generation failed unexpectedly. Please try again.', 500);
  }
});
