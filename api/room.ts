export const config = {
  runtime: 'edge',
};

// In-memory room cache for active edge instances
const roomStore = new Map<string, { doc: any; updatedAt: number }>();

export default async function handler(req: Request) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get('id');

  // GET /api/room?id=...
  if (req.method === 'GET') {
    if (!roomId) {
      return new Response(JSON.stringify({ error: 'Missing room id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const cached = roomStore.get(roomId);
    if (cached) {
      return new Response(JSON.stringify({ success: true, doc: cached.doc, updatedAt: cached.updatedAt }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Room not found or expired' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // POST /api/room
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const id = body.roomId || roomId;
      if (!id || !body.doc) {
        return new Response(JSON.stringify({ error: 'Missing roomId or doc payload' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      roomStore.set(id, { doc: body.doc, updatedAt: Date.now() });

      // Keep cache size bounded
      if (roomStore.size > 200) {
        const oldestKey = roomStore.keys().next().value;
        if (oldestKey) roomStore.delete(oldestKey);
      }

      return new Response(JSON.stringify({ success: true, roomId: id }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
