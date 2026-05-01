# FLOWX — Real-Time Market Dashboard

A full-stack real-time financial data dashboard with WebSocket streaming, JWT auth, and live price charts.

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 |
| Auth | JWT (PyJWT + bcrypt) |
| Database | PostgreSQL 16 + asyncpg |
| Data Source | Yahoo Finance (yfinance) |
| Realtime | WebSockets (native FastAPI) |
| Container | Docker + Docker Compose |

## Quick Start

### Option A — Docker Compose (recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option B — Local Dev

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set env vars (or create .env)
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketdash
export JWT_SECRET=your-secret-here

uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
market-dashboard/
├── backend/
│   ├── main.py              # FastAPI app, WebSocket endpoint, background poller
│   ├── auth.py              # JWT login/register/demo-login
│   ├── market_data.py       # yfinance service (quotes + OHLCV history)
│   ├── connection_manager.py# WebSocket broadcast manager
│   ├── database.py          # asyncpg pool + schema init
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── store/
│   │   │   ├── authStore.ts      # Zustand auth (JWT persisted)
│   │   │   └── marketStore.ts    # Zustand quotes, history, WS state
│   │   ├── hooks/
│   │   │   └── useMarketWebSocket.ts  # WS hook (auto-reconnect, ping)
│   │   ├── components/
│   │   │   ├── QuoteCard.tsx     # Ticker card with price flash
│   │   │   ├── PriceChart.tsx    # Recharts area + volume bar chart
│   │   │   └── StatsPanel.tsx    # OHLCV stats + WS status
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx     # JWT login + demo login
│   │   │   └── DashboardPage.tsx # Main layout
│   │   └── utils/api.ts          # Axios instance with JWT interceptor
│   └── package.json
└── docker-compose.yml
```

## Key Design Decisions

- **Single poller pattern**: Backend polls Yahoo Finance every 15s and broadcasts to all WebSocket clients. Never expose the data API directly to the browser — avoids rate limiting.
- **Demo login**: `/auth/demo-login` issues a valid JWT without a DB, so the dashboard works instantly without setup.
- **Zustand persistence**: Auth token is stored in localStorage via `persist` middleware, so sessions survive page reloads.
- **Price flash animation**: CSS keyframe animations trigger on every quote update to visually indicate direction.
- **Reconnect logic**: WebSocket hook automatically reconnects after 3s on unintentional disconnect.
