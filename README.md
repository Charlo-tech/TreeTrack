# TreeTrack — Reforestation Monitoring MVP

**Stack:** Next.js 16 (App Router) • TypeScript • Tailwind CSS • shadcn/ui • Lucide React • Recharts • Leaflet + React-Leaflet (OpenStreetMap) • Supabase (Postgres + PostGIS + Storage + Auth)

```
MONITOR → DETECT → ANALYZE → VERIFY → ACT
```

OpenStreetMap tiles. No Google/Mapbox. All backend via Next.js Route Handlers under `app/api/`.

## Quick start

```bash
npm install
cp .env.example .env   # fill Supabase keys
npm run dev            # http://localhost:3000
```

Deploys directly to **Vercel** + Supabase.

## Env

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# New Supabase (sb_publishable_...), legacy ANON_KEY (JWT) also accepted:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...  # legacy fallback
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # or SUPABASE_SECRET_KEY=sb_secret_... — server only
WOLFRAM_APP_ID=              # optional — falls back to mock
AT_USERNAME=                 # optional — mock SMS when blank
AT_API_KEY=
AT_SENDER_ID=TreeTrack
AT_SHORTCODE=
```

> Client/server code accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **or** legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`src/lib/supabase/client.ts:1`, `server.ts:1`); admin accepts `SUPABASE_SERVICE_ROLE_KEY` **or** `SUPABASE_SECRET_KEY` (`admin.ts:1`). Never expose the service/secret key to the browser.

## Supabase

- Apply `supabase/schema.sql` in SQL editor (enables PostGIS, creates tables, RLS, storage buckets `imagery` / `field-reports`).
- Buckets are **public** for hackathon demo; tighten RLS later.
- Service-role key is never exposed to browser — only `lib/supabase/admin.ts` (server).

### Tables

`projects`, `plots` (PostGIS Polygon), `vegetation_observations`, `imagery`, `vision_analyses`, `environmental_events`, `field_reports`, `alerts`, `notifications`, `profiles`.

## Project structure

```
src/
  app/
    page.tsx                 # Dashboard: health overview, priority C3
    monitoring/page.tsx      # Leaflet map + PlotDetailsPanel + NDVIChart
    alerts/page.tsx
    reports/page.tsx
    demo/page.tsx            # Demo Center
    api/
      projects/..., plots/[id]/..., vision/analyze, analytics/analyze,
      reports, alerts, ussd, sms, notifications/sms, demo/simulate, imagery
  components/
    ui/                      # shadcn: button, card, badge, input, textarea, separator
    map/                     # MonitoringMap, ClientMap, PlotLayer, PlotPolygon, PlotPopup, MapLegend, MapControls
    layout/                  # Sidebar, Header, WorkflowStepper
    plots/PlotDetailsPanel
    charts/NDVIChart
    demo/DemoCenter
  lib/
    supabase/{client,server,admin}
    analytics/{types, environmental, mock, wolfram}
    vision/{types, mock, analyzer}
    imagery/{types, mock, provider}
    messaging/{types, mock, africastalking, provider}
    mock-data.ts             # 24 deterministic plots, C3 = 18.2ha critical
    utils.ts                 # getPlotStatus, getPlotStyle, calculateNDVI, calculateNDVIChange
    validators.ts            # Zod schemas
supabase/schema.sql
.env.example
```

## Key contracts

- **Plot status:** `getPlotStatus(score)` → `healthy ≥75 | needs_attention ≥50 | at_risk ≥30 | critical <30`; `getPlotStyle(status)` centralizes leaflet style (no hard-coding).
- **NDVI:** `calculateNDVI(nir,red)` guards `nir+red=0` + bounds; `calculateNDVIChange(prev,cur)` returns %.
- **API responses:** `{ success:true, data }` or `{ success:false, error:{code,message}}` — validated with Zod.
- **Vision:** `VisionAnalyzer.analyze()` → mock deterministic (labels itself `mock`) — swap in `lib/vision/analyzer.ts`.
- **Environmental:** `MockEnvironmentalAnalyzer` + `WolframEnvironmentalAnalyzer` behind `EnvironmentalAnalyzer` interface.
- **Messaging:** `MockMessagingProvider` simulates SMS (`status=simulated`) and USSD `*384*TREES#` flow; `AfricasTalkingProvider` when creds set.
- **Imagery:** Supabase Storage `imagery` / `field-reports`; never store BLOB in Postgres.

## Map

- `components/map/*` — GeoJSON, project boundary (dashed), plots colored by health, click → `fetch /api/plots/:id` → `PlotDetailsPanel` (health, NDVI, ndvi_change %, trees, last inspection, actions).
- Tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.

## Demo Center (`/demo`)

- **Run Environmental Event** — 8-step visual timeline: update imagery → vision → NDVI → analytics → risk → alert → investigation → SMS. Calls `POST /api/demo/simulate`.
- Also: Simulate vegetation decline / field report / SMS / Reset.
- All mock-labeled; architecture is swap-ready for real services.

## USSD

```
POST /api/ussd   # AT x-www-form-urlencoded: sessionId, phoneNumber, text, serviceCode
*384*TREES#
  1 Report tree loss
  2 Report fire
  3 Report illegal clearing
  4 Report tree health
  5 Check assigned plot
```

Mock provider returns `CON` / `END` responses; persists nothing unless wired to Supabase.

## Africa's Talking SMS

```
POST /api/notifications/sms { recipient, message, alert_id? }
→ { status: "simulated"|"sent", provider_message_id }
```

## Build / deploy

```bash
npm run build -- --webpack   # win32; turbopack needs native binding
npm start
# Vercel: import repo, add env, deploy — no extra infra.
```

## RLS

Enabled on all tables; demo policy = `allow all using (true)` — tighten post-hackathon. Storage public read.

## Architecture

```
Next.js ─┬─ UI (Leaflet, Recharts, shadcn)
         ├─ API Routes
         └─ Supabase Client ─┬─ Postgres + PostGIS
                             └─ Storage
         ├─ Wolfram (optional)
         └─ Africa's Talking (optional)
```
