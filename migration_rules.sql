-- Motor de inferencia: reglas y estados de relés

CREATE TABLE IF NOT EXISTS public.rules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   TEXT NOT NULL,
  metrica      TEXT NOT NULL,      -- 'temperatura' | 'humo' | 'humedad'
  condicion    TEXT NOT NULL,      -- '>' | '<' | '='
  valor        NUMERIC NOT NULL,
  accion       TEXT NOT NULL,      -- 'encender' | 'apagar'
  actuador_id  INTEGER NOT NULL,   -- 1-4 (número de relé)
  activa       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relay_states (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   TEXT NOT NULL,
  relay_id     INTEGER NOT NULL,   -- 1-4
  estado       BOOLEAN DEFAULT false,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, relay_id)
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relay_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select_own" ON public.rules
  FOR SELECT USING (true);

CREATE POLICY "rules_insert_own" ON public.rules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "rules_update_own" ON public.rules
  FOR UPDATE USING (true);

CREATE POLICY "rules_delete_own" ON public.rules
  FOR DELETE USING (true);

CREATE POLICY "relay_states_all" ON public.relay_states
  FOR ALL USING (true);
