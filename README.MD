# KYROS Web Platform — Dashboard Industrial IoT

Plataforma web industrial para monitorear, automatizar y controlar plantas de producción en tiempo real. Construida con React + Vite + TailwindCSS en el frontend e InsForge (backend-as-a-service compatible con Supabase) como base de datos y autenticación.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite + TailwindCSS 4 |
| Backend | InsForge (Supabase-compatible) |
| Edge Functions | Deno / TypeScript |
| Hardware | ESP32 (KYROSYS Core) + sensores satélite via ESP-NOW |
| Deploy | Vercel |

---

## Funcionalidades Implementadas

### Autenticación
- Registro e inicio de sesión con InsForge Auth
- Rutas protegidas — redirige a `/signin` si no hay sesión activa
- Perfil de usuario con nombre de empresa y PIN de administrador (`user_profiles`)

### Dashboard
- Widgets de telemetría en vivo (temperatura, humedad, humo)
- Gráficas históricas con ApexCharts conectadas a InsForge
- Monitor de dispositivos activos (filtrado por MAC única)

### Telemetría
- Datos en tiempo real desde sensores ESP32
- Alertas visuales cuando un valor supera el umbral configurado
- Banner Plug & Play cuando se detecta un sensor nuevo en la red

### Automatización (Motor de Inferencia)
- CRUD completo de reglas: *si [métrica] [condición] [valor] → [acción] relay [N]*
- Motor de inferencia en Edge Function (`telemetry-ingest.ts`): evalúa reglas en cada lectura y actualiza `relay_states` automáticamente
- Control manual de relés (override) desde la UI
- Endpoint `rules-sync.ts` para que el ESP32 descargue sus reglas desde la nube

### Sectores
- Gestión de zonas de la planta con CRUD real en InsForge
- Badges de desconexión cuando un Core pierde comunicación
- Edición protegida por PIN de administrador (verificado contra `user_profiles`)

### Catálogo (Shop)
- Productos y hardware desde tabla `products` en InsForge
- Filtrado por categoría: Paquetes y Hardware/Sensores
- Sección de planes de suscripción (Starter / Enterprise)

---

## Esquema de Base de Datos (InsForge)

```sql
-- Perfil de empresa por usuario
user_profiles (id UUID PK, company_name, admin_pin)

-- Reglas de automatización
rules (id, company_id, metrica, condicion, valor, accion, actuador_id, activa, created_at)

-- Estado actual de relés
relay_states (id, company_id, relay_id, estado, updated_at)

-- Telemetría de sensores
telemetry (id, company_id, sector_id, mac, temperatura, humedad, humo, created_at)

-- Sectores / zonas de la planta
sectors (id, company_id, name, status, core_mac, created_at)

-- Catálogo de productos
products (id, name, description, price, category, image_url)
```

---

## Desarrollo Local

```bash
cd kyros-app
npm install
npm run dev
```

## Build y Deploy

```bash
cd kyros-app
npm run build
# Deploy automático via Vercel conectado al repo
```
