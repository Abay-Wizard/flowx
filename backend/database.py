import asyncpg
from dotenv import load_dotenv
load_dotenv()
import os
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
)

_pool:asyncpg.Pool|None=None
async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool=await asyncpg.create_pool(DATABASE_URL,min_size=2,max_size=10)
    return _pool


# _pool: asyncpg.Pool | None = None


# async def get_pool() -> asyncpg.Pool:
#     global _pool
#     if _pool is None:
#         _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
#     return _pool

@asynccontextmanager
async def get_db_connection():
    pool=await get_pool()
    async with pool.acquire() as conn:
        yield conn
    




# @asynccontextmanager
# async def get_db_connection():
#     pool = await get_pool()
#     async with pool.acquire() as conn:
#         yield conn


async def init_db():
    """Create tables if they don't exist."""
    try:
        async with get_db_connection() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            """)

            await conn.execute("""
                CREATE TABLE IF NOT EXISTS price_history (
                    id BIGSERIAL PRIMARY KEY,
                    symbol VARCHAR(10) NOT NULL,
                    price NUMERIC(12,4) NOT NULL,
                    volume BIGINT,
                    change_pct NUMERIC(8,4),
                    recorded_at TIMESTAMPTZ DEFAULT NOW()
                )
            """)

            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_price_history_symbol_time
                ON price_history(symbol, recorded_at DESC)
            """)

        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"DB init skipped (likely no DB in dev): {e}")
