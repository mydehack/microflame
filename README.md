# Flame in Freefall — NASA-Based Thruster Engine Explorer & Scientific Propulsion Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq AI](https://img.shields.io/badge/Groq-AI%20Inference-orange)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-emerald?logo=supabase)](https://supabase.com/)
[![NASA Open Science](https://img.shields.io/badge/NASA-CEA%20%26%20NTRS-red?logo=nasa)](https://ntrs.nasa.gov/)

**Flame in Freefall** is a scientific research and simulation web application for studying microgravity combustion physics, rocket propulsion thermodynamics, supersonic thruster exhaust plumes, and spacecraft reaction mechanisms.

---

## 🚀 Key Architectural Capabilities

### 1. Supersonic Thruster Exhaust Visualization
- **Procedural Real-Time Physics Canvas**: Renders realistic rocket thruster plume physics on an unobstructed canvas.
- **Aerodynamic Shock Structures**: Dynamically visualizes expansion fans, compression waves, Mach discs, and periodic shock diamonds as chamber pressure and ambient atmospheric/vacuum conditions vary.
- **Color Temperature Regimes**: Physically modeled emission gradients covering hypergolic, cryogenic LH2/LOX (deep blue/UV), methane/RP-1 (bright amber/orange soot), and ion/plasma electric propulsion (xenon cyan).

### 2. NASA Engine Catalog & CEA Thermodynamics
- **10 Verified NASA Flight Engines**: Complete technical records, chamber pressures, expansion ratios, and citations for RS-25 (SSME), RL10B-2, F-1, Merlin 1D Vac, J-2X, Raptor Vacuum, AJ10-190, NSTAR Ion, RD-180, and RS-68.
- **NASA CEA Solver**: Chemical Equilibrium with Applications (CEA) calculates gas-phase equilibrium composition, characteristic velocity ($C^*$), thrust coefficient ($C_F$), and vacuum specific impulse ($I_{sp}$).
- **NASA Technical Report Server (NTRS) Gateway**: Live search across NASA propulsion documents and technical memoranda.

### 3. Groq-Powered AI Scientific Research Bot
- **High-Speed Inference**: Sub-second latency responses powered by Groq LPUs (`openai/gpt-oss-120b`).
- **Adaptive Personas**:
  - **Beginner**: Conceptual guidance, intuitive analogies, and plain-English explanations.
  - **Guided**: Intermediate analysis connecting physical parameters to observed simulation results.
  - **Expert / Flight Engineer**: Rigorous propulsion thermodynamics, equilibrium species dissociation, and quantitative validation.

### 4. Smart Hover Guide System
- Context-aware tooltips and explanations active exclusively for the **Beginner** role.
- Explains 20+ propulsion and simulation parameters (equivalence ratio $\phi$, Grashof number $Gr$, chamber pressure, expansion ratio $\epsilon$) without cluttering the clean interface for Researchers.

### 5. Supabase Cloud Persistence & Storage Suite
- **11 Relational Entities**: Profiles, engines, experiments, simulation runs, simulation results, saved configurations, comparisons, research documents, conversations, messages, and reports.
- **Row Level Security (RLS)**: Enforced across all tables so users only access their authorized research data.
- **4 Dedicated Cloud Storage Buckets**:
  - `research-documents`: Technical papers, PDFs, and notes.
  - `simulation-exports`: CSV datasets, tabular time-series, and project `.fif.json` archives.
  - `generated-reports`: Formatted scientific memoranda and analysis summaries.
  - `visualization-exports`: Lossless 4K plume renders and 3D glTF/JSON geometry files.

---

## 🛠️ Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   NEXT.JS 16 FRONTEND                  │
│    (React 19, Tailwind CSS, Lucide Icons, Recharts)    │
│                 Port: 3000 (Local / Vercel)            │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST / Auth / Storage             │ Next.js Rewrites
                │                        ▼
┌───────────────▼──────────────┐ ┌────────────────────────┐
│      SUPABASE CLOUD          │ │    FASTAPI BACKEND     │
│  PostgreSQL (11 Tables, RLS) │ │ (Python, CEA Solver,   │
│  Storage (4 Buckets)         │ │  NTRS Gateway)         │
│  Auth (JWT Sessions)         │ │ Port: 8000             │
└──────────────────────────────┘ └───────────┬────────────┘
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │     GROQ CLOUD AI      │
                                 │  (LPU High-Speed LLM   │
                                 │   gpt-oss-120b)        │
                                 └────────────────────────┘
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js >= 20.9.0
- Python >= 3.10
- Git

### 1. Clone & Install Dependencies
```bash
# Install frontend packages
npm install

# Install Python backend packages
pip install -r backend/requirements.txt
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>
GROQ_API_KEY=<your-groq-api-key>
GROQ_MODEL=openai/gpt-oss-120b
NASA_API_KEY=DEMO_KEY
FASTAPI_BACKEND_URL=http://127.0.0.1:8000
```

### 3. Start Backend & Frontend
```bash
# Terminal 1: FastAPI Python Backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Next.js Frontend
npm run dev
# Or for production:
npm run build && npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Health Checks

Verify all systems with standard checks:
```bash
# TypeScript Typecheck
npm run typecheck

# Next.js Production Build
npm run build

# FastAPI Backend Health Check
curl http://127.0.0.1:8000/api/health

# Groq AI Model & Research Bot Status
curl http://127.0.0.1:8000/api/research-bot/health

# NASA Engine Catalogue Check
curl http://127.0.0.1:8000/api/engines
```

---

## 🚢 Production Deployment

### Frontend Deployment (Vercel)
1. Link your GitHub repository to Vercel.
2. Configure Environment Variables in the Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FASTAPI_BACKEND_URL`
3. Build Command: `npm run build`
4. Output Directory: `.next`

### Backend Deployment (Render / Railway / Cloud Run)
1. Deploy `backend/main.py` using `Dockerfile` or Python runtime:
   - Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
2. Configure Environment Variables:
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔒 Security Best Practices
- **Never commit `.env` or API tokens**: Enforced in `.gitignore`.
- **Row Level Security**: All database tables enforce strict tenant isolation via `auth.uid() = user_id`.
- **Public vs Secret Clients**: The browser client (`lib/supabase/client.ts`) uses the public anon key. The administrative client (`lib/supabase/admin.ts`) uses the `service_role` key exclusively in protected server-side routes.
