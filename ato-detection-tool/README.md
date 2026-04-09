# ATO Detection — Social Media Account Takeover Detection Tool

A production-ready, real-time **Account Takeover (ATO) Detection** system for social media platforms. Uses ensemble machine learning (Isolation Forest + One-Class SVM) to detect unauthorized access, impossible travel, unusual devices, and suspicious login patterns.

---

## Features

- **Real-time anomaly detection** — ensemble ML model scores every login session (0–1 risk)
- **Explainable AI** — clear reasons for every detection (e.g., "Impossible Travel Detected", "Unusual Device")
- **Fernet encryption** — social media passwords are encrypted before storage, never plain text
- **Role-Based Access Control** — Admin and Regular User roles with JWT authentication
- **Interactive dashboard** — live world map with color-coded markers (green/yellow/red)
- **PDF reports** — downloadable session and alert reports
- **Webhook alerts** — HTTP POST to your URL when risk > 0.8
- **Global search** — search by username, IP, location, device, email
- **Dark cyber UI** — Shodan-inspired dark theme with neon accents

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, Python 3.11, SQLAlchemy 2.0, Alembic, scikit-learn, Fernet |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Leaflet.js, Recharts |
| **Database** | PostgreSQL 16 (SQLite fallback for dev) |
| **ML** | Isolation Forest + One-Class SVM ensemble |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Deploy** | Docker + docker-compose |

---

## Quick Start (Docker)

### One-command deployment:

```bash
cd ato-detection-tool
cp .env.example .env
docker-compose up --build
```

Then open:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ato-detect.io | admin123 |
| User | demo@ato-detect.io | demo123 |

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Generate dataset and train model
python generate_dataset.py
python train_model.py

# Seed demo data
python seed_data.py

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
ato-detection-tool/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py           # Settings from env vars
│   │   │   ├── database.py         # SQLAlchemy engine + session
│   │   │   ├── security.py         # JWT + bcrypt utilities
│   │   │   └── encryption.py       # Fernet encrypt/decrypt
│   │   ├── models/
│   │   │   ├── user.py             # User table
│   │   │   ├── monitored_account.py # Monitored accounts table
│   │   │   ├── login_session.py    # Login sessions table
│   │   │   └── alert.py            # Alerts table
│   │   ├── routers/
│   │   │   ├── auth.py             # Register + login endpoints
│   │   │   ├── accounts.py         # CRUD monitored accounts
│   │   │   ├── sessions.py         # Analyze + list sessions
│   │   │   ├── alerts.py           # List alerts
│   │   │   └── reports.py          # PDF download endpoints
│   │   ├── schemas/                # Pydantic request/response models
│   │   └── services/
│   │       ├── ml_service.py       # ML prediction engine
│   │       ├── credential_service.py # Fernet encryption service
│   │       ├── alert_service.py    # Alert + webhook service
│   │       └── pdf_service.py      # PDF generation
│   ├── alembic/                    # Database migrations
│   ├── data/                       # Synthetic dataset (generated)
│   ├── ml_models/                  # Trained model (generated)
│   ├── generate_dataset.py         # 1000-record synthetic data generator
│   ├── train_model.py              # ML training script
│   ├── seed_data.py                # Database seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + AuthProvider
│   │   ├── page.tsx                # Home / hero page
│   │   ├── login/page.tsx          # Login / register
│   │   ├── dashboard/page.tsx      # Dashboard with stats + map
│   │   ├── monitor/page.tsx        # Live monitoring
│   │   ├── explore/page.tsx        # Global search
│   │   ├── reports/page.tsx        # PDF reports + alerts list
│   │   ├── globals.css             # Dark theme + Leaflet overrides
│   │   └── components/
│   │       ├── Header.tsx          # Shodan-style header
│   │       ├── WorldMap.tsx        # Leaflet world map
│   │       ├── AddAccountModal.tsx # Add monitored account modal
│   │       ├── SessionTable.tsx    # Sessions data table
│   │       └── StatsCard.tsx       # Dashboard stat card
│   ├── lib/
│   │   ├── api.ts                  # API client + types
│   │   └── auth.tsx                # Auth context provider
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Environment variable template
└── README.md
```

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/accounts/` | List monitored accounts | Yes |
| POST | `/api/accounts/` | Add monitored account (encrypts password) | Yes |
| DELETE | `/api/accounts/{id}` | Remove account | Yes |
| POST | `/api/sessions/analyze` | Submit login event for ML analysis | Yes |
| GET | `/api/sessions/` | List user's sessions | Yes |
| GET | `/api/sessions/all` | List all sessions (demo) | No |
| GET | `/api/sessions/dashboard` | Dashboard stats | Yes |
| GET | `/api/sessions/search?q=` | Global search | No |
| GET | `/api/alerts/` | List alerts | Yes |
| GET | `/api/reports/sessions` | Download sessions PDF | Yes |
| GET | `/api/reports/alerts` | Download alerts PDF | Yes |
| GET | `/api/health` | Health check | No |

---

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| email | String(255) | Unique, indexed |
| hashed_password | String(255) | bcrypt hash |
| role | String(20) | "admin" or "user" |
| created_at | DateTime | UTC timestamp |

### monitored_accounts
| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| user_id | Integer (FK) | References users.id |
| platform | String(50) | twitter, instagram, etc. |
| username | String(255) | Social media username |
| encrypted_password | String(512) | Fernet-encrypted password |
| created_at | DateTime | UTC timestamp |

### login_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| monitored_account_id | Integer (FK) | References monitored_accounts.id |
| ip | String(45) | IPv4/IPv6 address |
| location | String(255) | City, country |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| login_hour | Integer | 0–23 |
| device_type | String(100) | desktop, mobile, bot, etc. |
| risk_score | Float | 0.0 to 1.0 |
| is_takeover | Boolean | True if risk >= threshold |
| xai_reason | String(512) | Explainable AI reason |
| timestamp | DateTime | UTC timestamp |

### alerts
| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment |
| login_session_id | Integer (FK) | References login_sessions.id |
| risk_score | Float | Alert threshold score |
| message | String(512) | Human-readable alert |
| webhook_sent | Boolean | Webhook delivery status |
| created_at | DateTime | UTC timestamp |

---

## ML Model

**Architecture:** Ensemble of Isolation Forest + One-Class SVM

**Features:** login_hour, device_type (encoded), latitude, longitude, ip_hash, hour_sin, hour_cos

**Training:** Unsupervised — trained on normal behavior only, detects anomalies as deviations from baseline.

**Target accuracy:** >= 85% on the synthetic 1000-record dataset.

---

## Security

- Passwords hashed with **bcrypt** (tool user passwords)
- Social media credentials encrypted with **Fernet** (AES-128-CBC)
- JWT authentication with configurable expiry
- CORS configured per environment
- Rate limiting (100 req/min per IP)
- Security headers (X-Frame-Options, CSP, HSTS, etc.)
- All sensitive config via environment variables

---

## Production Deployment Notes

1. **Change all secrets** in `.env` — especially `SECRET_KEY` and `FERNET_KEY`
2. Use a proper PostgreSQL instance (not the Docker one for production data)
3. Add TLS termination (nginx/Caddy reverse proxy)
4. Configure `WEBHOOK_URL` for your alerting system (Slack, PagerDuty, etc.)
5. Set `DEBUG=false` in production
6. Consider adding Redis for caching and session storage
7. Set up log aggregation (ELK, Datadog, etc.)

---

## License

MIT
