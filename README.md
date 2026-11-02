# JANASHAKTI (ಜನಶಕ್ತಿ)
### Civic Safety & Community Incident Reporting Platform
**Pilot City:** Davanagere, Karnataka, India (`14.4644° N, 75.9218° E`, 45 Municipal Wards, Davanagere City Corporation / Mahanagara Palike)

---

## 1. Overview & Vision
**JANASHAKTI** is a production-oriented, responsive civic platform that empowers citizens to report civic emergencies, hazards (potholes, water leaks, streetlight failures, garbage dumps, accidents), and infrastructure failures directly to municipal authorities. 

The platform implements a **dual-interface architecture**:
1. **Citizen Portal**: Clean, accessible, mobile-first progressive interface with high contrast, touch targets, and low-bandwidth resilience.
2. **Authority Command Center**: Professional command-center layout featuring spatial triage, verification workflow, ward filtering, and audit accountability.

---

## 2. Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS | Single Page App with Inter typography and Navy/Electric Blue/Teal design identity |
| **Backend API** | Node.js + Express | REST API, JWT auth, rate limiting, file upload controls, RBAC middleware |
| **Database** | PostgreSQL 15+ & PostGIS | Relational schema with spatial point geometries (`SRID 4326`) and GiST spatial indexes |
| **Real-time** | Socket.IO | Bidirectional event gateway for live feeds and authority status changes |
| **AI Integration** | Python + FastAPI (Module 8) | Incident categorization, duplicate detection, and triage score suggestions |
| **Push Alerts** | Firebase Cloud Messaging (FCM) | Proximity alerts and dispatch notifications (Module 9) |
| **Maps** | Leaflet + OpenStreetMap | Interactive spatial incident display and ward boundaries |

---

## 3. Strict Civic Safeguards & Compliance Rules

1. **AI Output Is Never Official Verification:**
   - Any suggestions from AI models are strictly labeled as advisory. Official verification requires explicit authorization by a human officer holding `AUTHORITY` or `ADMIN` role.
2. **Citizen Privacy Shield (Location Coarsening):**
   - Exact domestic GPS coordinates are never published on the public feed. Coordinates for public viewers are coarsened (~100m) to preserve household privacy.
3. **Reporter Personal Details Redacted:**
   - Public feeds and unverified views redact reporter phone number, email, and identity.
4. **Backend-Enforced Authorization:**
   - Status transitions (`OFFICIALLY_VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, `DUPLICATE`) are guarded by role-based access control.

---

## 4. Project Directory Structure

```
JANASHAKTI/
├── package.json                    # Root orchestrator (concurrent dev & install)
├── .gitignore                      # Git ignore configuration
├── .env.example                    # Global environment template
├── README.md                       # Execution and architecture documentation
│
├── server/                         # Express + Node.js + Socket.IO Backend
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js                  # Express middleware, CORS, Helmet, routes
│   │   ├── server.js               # HTTP server & Socket.IO initialization
│   │   ├── config/
│   │   │   ├── constants.js        # Roles, statuses, categories & Davanagere data
│   │   │   ├── db.js               # PostgreSQL pool + high-fidelity dev store
│   │   │   └── env.js              # Environment validation
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # JWT auth, register, login, demo profiles
│   │   │   ├── health.controller.js# Telemetry & pilot health status
│   │   │   ├── incident.controller.js# Incident submission & public feed
│   │   │   └── authority.controller.js# Command metrics & status transitions
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT Bearer token validator
│   │   │   ├── rbac.middleware.js  # Role verification (Citizen/Volunteer/Authority/Admin)
│   │   │   ├── rateLimiter.middleware.js# Anti-abuse rate limiting
│   │   │   ├── upload.middleware.js# Multer photo upload validator (<5MB, JPG/PNG)
│   │   │   └── errorHandler.middleware.js
│   │   ├── routes/                 # Express REST routes
│   │   ├── sockets/                # Socket.IO room and event handlers
│   │   └── utils/
│   │       ├── geoUtils.js         # Haversine distance, bounds, coordinate jitter
│   │       ├── privacyMasker.js    # PII scrubber and spatial coarsener
│   │       └── logger.js           # Structured logging
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql # Relational & PostGIS tables
│   │   │   └── 002_postgis_indexes.sql # GiST spatial acceleration indexes
│   │   └── seeds/
│   │       └── 001_davanagere_seed.sql # 45 Wards & pilot departments
│   └── tests/
│       └── health.test.js          # Automated endpoint test suite
│
├── client/                         # React 18 + Vite + Tailwind CSS Frontend
│   ├── package.json
│   ├── vite.config.js              # Reverse proxy for /api, /uploads, /socket.io
│   ├── tailwind.config.js          # Custom palette: navy, electric blue, teal
│   ├── postcss.config.js
│   ├── index.html                  # Inter font & Leaflet CDN
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Routing and navigation state
│       ├── index.css
│       ├── components/common/
│       │   ├── Navbar.jsx          # Brand logo, role switcher & auth controls
│       │   ├── Footer.jsx          # Davanagere emergency helplines
│       │   ├── StatusBadge.jsx     # Incident status badge
│       │   ├── RoleBadge.jsx       # RBAC role badge
│       │   └── HealthWidget.jsx    # Live telemetry and database connection
│       ├── context/
│       │   ├── AuthContext.jsx     # User state & demo profile switcher
│       │   └── SocketContext.jsx   # Real-time WebSocket connection
│       ├── pages/
│       │   ├── LandingPage.jsx     # Hero, pilot statistics & public feed
│       │   ├── CitizenDashboard.jsx# Mobile-first incident reporting & GPS
│       │   ├── AuthorityDashboard.jsx# Command center triage & verification
│       │   ├── SystemArchitectureView.jsx # 10-Phase roadmap & blueprint
│       │   └── LoginPage.jsx       # Sign in & 1-click test roles
│       ├── services/
│       │   └── api.js              # Frontend API client
│       └── utils/
│           ├── constants.js
│           └── davanagereData.js   # 45 Davanagere wards & emergency contacts
│
└── ai-service/                     # Python + FastAPI (Module 8 Microservice)
    ├── requirements.txt
    ├── main.py                     # AI categorization & human-in-the-loop policy
    └── README.md
```

---

## 5. Execution Instructions

### Prerequisites
- Node.js (v18+ recommended; tested on v24)
- npm (v9+)

### Installation
Run from the root directory:
```powershell
# Install root, backend and frontend dependencies
npm run install:all
```

Or install individually:
```powershell
# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### Running the Services

#### Option A: Run Both Concurrently (Recommended)
```powershell
npm run dev
```

#### Option B: Run in Separate Terminals
**Terminal 1 (Backend Server on Port 5000):**
```powershell
cd server
npm run dev
```

**Terminal 2 (Frontend Client on Port 5173):**
```powershell
cd client
npm run dev
```

### Running Backend Automated Tests
```powershell
npm test
```
Or directly in the server directory:
```powershell
cd server
npm test
```

---

## 6. Pre-Configured Test Accounts (RBAC)

Use these accounts (or the one-click demo role switcher in the UI header) to test RBAC enforcement:

| Role | Email | Password | Intended Workflow |
| :--- | :--- | :--- | :--- |
| **CITIZEN** | `ramesh.cit@example.com` | `Password@123` | Report hazards, view personal history, confirm nearby issues |
| **VOLUNTEER** | `priya.vol@example.com` | `Password@123` | Community vouching and ward-level support |
| **AUTHORITY** | `officer@mcc.gov.in` | `Password@123` | Official verification, department dispatch, status commits |
| **ADMIN** | `admin@janashakti.gov.in` | `Password@123` | Full system audit logs, user management, and metrics |

---

## 7. Ten-Phase Delivery Roadmap

- [x] **Phase 1: Project Structure & Architecture** *(Completed & Verified)*
- [x] **Phase 2: Responsive Landing Page & Authentication** *(Completed & Verified)*
- [x] **Phase 3: Citizen Dashboard & Incident Reporting** *(Completed & Verified)*
- [x] **Phase 4: PostgreSQL + PostGIS Persistence** *(Completed & Verified)*
- [x] **Phase 5: Interactive Live Map (Leaflet + OpenStreetMap)** *(Completed & Verified)*
- [x] **Phase 6: Socket.IO Real-time Updates** *(Completed & Verified)*
- [x] **Phase 7: Authority Command Dashboard & Audit Console** *(Completed & Verified)*
- [x] **Phase 8: AI Incident Classification Microservice** *(Completed & Verified)*
- [x] **Phase 9: Push Notifications & Community Alerts** *(Completed & Verified)*
- [x] **Phase 10: Pilot-Ready Testing & Docker Production Packaging** *(Completed & Verified)*

---

## 8. Docker Production Deployment

To spin up the entire production environment with PostgreSQL 15 + PostGIS, Node.js backend, Python FastAPI AI service, and Nginx frontend in containers:

```powershell
docker-compose up --build -d
```

- **Frontend App:** http://localhost:80
- **Backend API:** http://localhost:5000 (Health: http://localhost:5000/api/health)
- **FastAPI AI Service:** http://localhost:8000
- **PostgreSQL / PostGIS:** localhost:5432 (Database: `janashakti_db`)

