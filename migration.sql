INSERT INTO public.products (id, name, description, price, category, image_url) VALUES 
('6a0a73b1-a2e6-9b8f-d2db-f43f00000000', 'KYROSYS Core v1', 'Gateway industrial con soporte para 20 nodos y conectividad Wi-Fi Dual Band.', 2499, 'Hub', 'router'),
('6a0a7400-a2e6-9b8f-d2db-f44000000000', 'Pack Monitoreo Base', '1 Core v1 + 2 Sensores de Temperatura/Humedad. Ideal para áreas pequeñas.', 3200, 'Package', 'package_2'),
('6a0a750e-a2e6-9b8f-d2db-f44100000000', 'Pack Monitoreo Premium', '1 Core v1 + 4 Sensores (Temp/Hum/Gas). Incluye kit de montaje en riel DIN.', 5068, 'Package', 'inventory_2'),
('6a0a7538-a2e6-9b8f-d2db-f44200000000', 'Pack Monitoreo Ultra', 'Sistema completo: Core v1 + 8 Sensores mixtos + Licencia Enterprise por 3 meses.', 9000, 'Package', 'deployed_code'),
('6a0a7562-a2e6-9b8f-d2db-f44300000000', 'Módulo de Gas y Humo', 'Nodo inalámbrico autónomo con sensor MQ-2 para detección de fugas y principios de incendio.', 680, 'Sensor', 'detector_smoke'),
('6a0a75e2-a2e6-9b8f-d2db-f44400000000', 'Módulo de Temperatura y Humedad', 'Módulo de alta precisión para control climático en racks y líneas de producción.', 550, 'Sensor', 'thermostat'),
('6a0a7618-a2e6-9b8f-d2db-f44500000000', 'Módulo de Movimiento', 'Sensor PIR de largo alcance para detección de presencia en áreas restringidas.', 620, 'Sensor', 'motion_sensor_active'),
('6a0a7641-a2e6-9b8f-d2db-f44600000000', 'Módulo de Luz', 'Medición de intensidad lumínica para automatización de luminarias industriales.', 480, 'Sensor', 'light_mode');

INSERT INTO public.sectors (id, name, sector_id, icon, status) VALUES 
('6a065e8d-cc2d-1389-49fb-2c9000000000', 'Almacen', 'SC-3729-W', 'conveyor_belt', 'Desconectado'),
('6a0a154d-fbf6-8b3a-8905-726500000000', 'Linea de producción 1', 'SC-3729-R', 'precision_manufacturing', 'alert');

INSERT INTO public.modules (id, name, type, sector_id, mac_address, status) VALUES
('6a0a2e31-d584-3d6a-c53f-fcfa00000000', 'Módulo de Temperatura', 'Temperatura', 'SC-3729-W', 'E4:B0:63:41:F6:A4', 'active'),
('6a0a4d67-0294-23f2-2348-ce3600000000', 'Módulo de Gas', 'Gas', 'SC-3729-W', 'DD:B0:45:41:00:C3', 'alert');

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

-- RLS: solo el service role escribe desde edge functions
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
