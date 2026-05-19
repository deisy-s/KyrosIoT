const BASE = Deno.env.get('INSFORGE_BASE_URL') ?? ''
const API_KEY = Deno.env.get('API_KEY') ?? ''
const ANON_KEY = Deno.env.get('ANON_KEY') ?? ''

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
}

export default async (req: Request) => {
  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Método no permitido' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    const url = new URL(req.url)
    const company_id = url.searchParams.get('company_id')

    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id es requerido' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const qs = new URLSearchParams({
      company_id: `eq.${company_id}`,
      activa: 'eq.true',
      select: 'id,metrica,condicion,valor,accion,actuador_id',
    }).toString()

    const res = await fetch(`${BASE}/api/database/records/rules?${qs}`, { headers })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`${res.status} ${txt}`)
    }

    const rules = await res.json()

    return new Response(JSON.stringify(Array.isArray(rules) ? rules : []), {
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
