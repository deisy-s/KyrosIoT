const BASE = Deno.env.get('INSFORGE_BASE_URL') ?? ''
const API_KEY = Deno.env.get('API_KEY') ?? ''
const ANON_KEY = Deno.env.get('ANON_KEY') ?? ''

const headers = {
  'Content-Type': 'application/json',
  'apikey': API_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const { sectorId } = await req.json()

    if (!sectorId) {
      return new Response(JSON.stringify({ error: 'sectorId es requerido' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const res = await fetch(`${BASE}/api/database/records/sectors`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        sector_id: sectorId,
        status: 'online',
        last_seen: new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`upsert sectors: ${res.status} ${txt}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}
