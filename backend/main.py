from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import asyncio
import json
import logging
from datetime import datetime

from auth import router as auth_router, verify_token
from market_data import MarketDataService
from connection_manager import ConnectionManager
from database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

manager = ConnectionManager()
market_service = MarketDataService()
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    streaming_task = asyncio.create_task(stream_market_data())
    yield
    streaming_task.cancel()
    try:
        await streaming_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Market Data Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://flowx-a.vercel.app/login", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])


async def stream_market_data():
    """Background task: poll Yahoo Finance every 15s, broadcast to WebSocket clients."""
    symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD"]
    while True:
        try:
            data = await market_service.fetch_quotes(symbols)
            if data and manager.active_connections:
                await manager.broadcast(json.dumps({
                    "type": "quote_update",
                    "data": data,
                    "timestamp": datetime.utcnow().isoformat()
                }))
        except Exception as e:
            logger.error(f"Streaming error: {e}")
        await asyncio.sleep(15)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    payload = verify_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket)
    try:
        # Send initial data snapshot on connect
        symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD"]
        initial_data = await market_service.fetch_quotes(symbols)
        await websocket.send_text(json.dumps({
            "type": "initial_snapshot",
            "data": initial_data,
            "timestamp": datetime.utcnow().isoformat()
        }))

        while True:
            # Keep connection alive, handle client messages
            msg = await websocket.receive_text()
            data = json.loads(msg)
            if data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@app.get("/api/quotes")
async def get_quotes(credentials: HTTPAuthorizationCredentials = Depends(security)):
    verify_token(credentials.credentials) or (_ for _ in ()).throw(
        HTTPException(status_code=401, detail="Invalid token")
    )
    symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD"]
    data = await market_service.fetch_quotes(symbols)
    return {"data": data, "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/history/{symbol}")
async def get_history(
    symbol: str,
    period: str = "1mo",
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    history = await market_service.fetch_history(symbol.upper(), period)
    return {"symbol": symbol.upper(), "data": history}


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
