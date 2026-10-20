export const config = {
  runtime: 'edge',
};

const VALID_ANTHROPIC_MODELS = new Set([
  'claude-sonnet-5-5',
  'claude-opus-5-5',
  'claude-fable-5-1',
  'claude-haiku-5-5',
  'claude-opus-5',
  'claude-sonnet-5',
  'claude-fable-5',
  'claude-opus-4-8',
  'claude-opus-4-7',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
  'claude-opus-4-5-20251101',
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5-20250929',
]);

function sanitizeModel(rawModel?: string): string {
  if (!rawModel) return 'claude-sonnet-5-5';
  const m = rawModel.trim().toLowerCase();
  if (VALID_ANTHROPIC_MODELS.has(m)) return m;

  // Resilient fallback mapping for old/cached client models
  if (m.includes('opus')) return 'claude-opus-5-5';
  if (m.includes('fable')) return 'claude-fable-5-1';
  if (m.includes('haiku')) return 'claude-haiku-5-5';
  return 'claude-sonnet-5-5';
}

export default async function handler(req: Request) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await req.json();
    const clientKey = req.headers.get('x-api-key')?.trim();
    const apiKey = clientKey || process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'Anthropic API key is required. Please set your key in Settings.' } }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Sanitize model to guarantee official Anthropic account compatibility
    body.model = sanitizeModel(body.model);

    // Set high output limit for limitless presentation generation
    if (!body.max_tokens) {
      body.max_tokens = 8192;
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicResponse.text();
    return new Response(data, {
      status: anthropicResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: { message: err.message || 'Server error proxying to Claude' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
