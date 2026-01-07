// Claude API wrapper for CV generation
// Using Claude 3.5 Haiku for cost-effective, fast responses

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-haiku-20241022';
const MAX_TOKENS = 2048;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function callClaude(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens: number = MAX_TOKENS
): Promise<{ success: true; data: ClaudeResponse } | { success: false; error: string }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    return { success: false, error: 'ANTHROPIC_API_KEY not configured' };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json() as ClaudeResponse;
    return { success: true, data };
  } catch (error) {
    console.error('Claude API call failed:', error);
    return { success: false, error: error.message || 'Failed to call Claude API' };
  }
}

// Parse JSON from Claude's response, handling potential markdown code blocks
export function parseJsonResponse<T>(text: string): { success: true; data: T } | { success: false; error: string } {
  try {
    // Remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText) as T;
    return { success: true, data: parsed };
  } catch (error) {
    console.error('JSON parse error:', error, 'Text:', text.slice(0, 200));
    return { success: false, error: 'Failed to parse AI response' };
  }
}
