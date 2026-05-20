const BASE = Deno.env.get('INSFORGE_BASE_URL') ?? ''
const API_KEY = Deno.env.get('API_KEY') ?? ''
const ANON_KEY = Deno.env.get('ANON_KEY') ?? ''

const headers = {
  'Content-Type': 'application/json',
  'apikey': API_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
}

const SAFE_STATE = { '1': false, '2': false, '3': false, '4': false }

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const url = new URL(req.url)
    const sectorId = url.searchParams.get('sectorId')

    if (!sectorId) {
      return new Response(JSON.stringify(SAFE_STATE), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 1. Lookup company_id from sector
    const sectorRes = await fetch(
      `${BASE}/api/database/records/sectors?sector_id=eq.${encodeURIComponent(sectorId)}&select=company_id`,
      { headers }
    )
    if (!sectorRes.ok) throw new Error(`sectors lookup: ${sectorRes.status}`)

    const sectors = await sectorRes.json()
    const company_id = Array.isArray(sectors) && sectors.length > 0 ? sectors[0].company_id : null

    if (!company_id) {
      return new Response(JSON.stringify(SAFE_STATE), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Read relay_states for this company
    const relayRes = await fetch(
      `${BASE}/api/database/records/relay_states?company_id=eq.${company_id}&select=relay_id,estado`,
      { headers }
    )
    if (!relayRes.ok) throw new Error(`relay_states lookup: ${relayRes.status}`)

    const relays = await relayRes.json()
    const result: Record<string, boolean> = { ...SAFE_STATE }

    if (Array.isArray(relays)) {
      for (const r of relays) {
        result[String(r.relay_id)] = Boolean(r.estado)
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify(SAFE_STATE), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  }
}
