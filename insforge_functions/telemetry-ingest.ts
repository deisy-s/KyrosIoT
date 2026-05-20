type Condicion = '>' | '<' | '='

function evaluar(medido: number, condicion: Condicion, umbral: number): boolean {
  if (condicion === '>') return medido > umbral
  if (condicion === '<') return medido < umbral
  if (condicion === '=') return medido === umbral
  return false
}

const BASE = Deno.env.get('INSFORGE_BASE_URL') ?? ''
const API_KEY = Deno.env.get('API_KEY') ?? ''
const ANON_KEY = Deno.env.get('ANON_KEY') ?? ''

const headers = {
  'Content-Type': 'application/json',
  'apikey': API_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
}

async function dbPost(table: string, body: unknown, prefer?: string) {
  const res = await fetch(`${BASE}/api/database/records/${table}`, {
    method: 'POST',
    headers: prefer ? { ...headers, 'Prefer': prefer } : headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`POST ${table}: ${res.status} ${txt}`)
  }
  return res
}

async function dbGet(table: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/api/database/records/${table}?${qs}`, { headers })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`GET ${table}: ${res.status} ${txt}`)
  }
  return res.json()
}

export default async (req: Request) => {
  try {
    const payload = await req.json()
    const { mac_origen, tipo, valor, sectorId } = payload
    let { company_id } = payload

    if (!mac_origen || !tipo || valor === undefined) {
      return new Response(JSON.stringify({ error: 'mac_origen, tipo y valor son requeridos' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Resolver company_id desde sectorId si no viene directo
    if (!company_id && sectorId) {
      const sectors = await dbGet('sectors', {
        sector_id: `eq.${sectorId}`,
        select: 'company_id',
      })
      company_id = Array.isArray(sectors) && sectors.length > 0 ? sectors[0].company_id : null
    }

    // 1. Insertar telemetría
    await dbPost('telemetry', { mac_address: mac_origen, type: tipo, value: Number(valor) })

    // 2. Motor de inferencia
    if (company_id) {
      const valorNumerico = Number(valor)
      const metricaNorm = String(tipo).toLowerCase()

      const rules = await dbGet('rules', {
        company_id: `eq.${company_id}`,
        activa: 'eq.true',
        metrica: `eq.${metricaNorm}`,
      })

      for (const rule of Array.isArray(rules) ? rules : []) {
        if (evaluar(valorNumerico, rule.condicion as Condicion, Number(rule.valor))) {
          const nuevoEstado = rule.accion === 'encender'
          await dbPost(
            'relay_states',
            {
              company_id,
              relay_id: rule.actuador_id,
              estado: nuevoEstado,
              updated_at: new Date().toISOString(),
            },
            'resolution=merge-duplicates'
          )
        }
      }
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
