export const config = {
  runtime: 'edge',
};

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

    // Model normalization to ensure official Anthropic API compatibility
    const modelAliases: Record<string, string> = {
      'claude-sonnet-5-5': 'claude-3-7-sonnet-20250219',
      'claude-opus-5-5': 'claude-3-opus-20240229',
      'claude-fable-5-1': 'claude-3-5-sonnet-20241022',
      'claude-haiku-5-5': 'claude-3-5-haiku-20241022',
      'claude-sonnet-4-5-20250929': 'claude-3-5-sonnet-20241022',
      'claude-opus-4-5-20251101': 'claude-3-opus-20240229',
      'claude-3-7-sonnet': 'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
    };

    if (body.model && modelAliases[body.model]) {
      body.model = modelAliases[body.model];
    }

    // Maximize token output limit for limitless presentation generation
    if (!body.max_tokens || body.max_tokens < 8192) {
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
