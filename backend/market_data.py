import asyncio
import yfinance as yf
from datetime import datetime
import logging
import time  # Needed for cache timing

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self):
        self._cache: dict = {}
        self._cache_ttl = 10 

    async def fetch_quotes(self, symbols: list[str]) -> list[dict]:
        """Fetch real-time quotes with a 'Check Cache First' logic."""
        current_time = time.time()
        
        # 1. Try to get data from our short-term memory
        cached_data = self._get_from_cache(symbols, current_time)
        if cached_data:
            return cached_data

        # 2. Cache Miss: Do the heavy lifting of scraping Yahoo
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, self._fetch_quotes_sync, symbols)

        # 3. Save the results so the next person gets them instantly
        self._save_to_cache(results, current_time)
        
        return results

    def _get_from_cache(self, symbols: list[str], current_time: float):
        """Helper to check if all requested symbols are fresh in the cache."""
        results = []
        for symbol in symbols:
            cache_entry = self._cache.get(symbol)
            
            # If a symbol is missing OR too old, the whole batch fails cache check
            if not cache_entry or (current_time - cache_entry["time"] > self._cache_ttl):
                return None
            
            results.append(cache_entry["data"])
        
        logger.info(f"Cache Hit: Served {len(symbols)} symbols from memory.")
        return results

    def _save_to_cache(self, results: list[dict], current_time: float):
        """Helper to store fresh results into the dictionary."""
        for item in results:
            if "symbol" in item and "error" not in item:
                self._cache[item["symbol"]] = {
                    "time": current_time,
                    "data": item
                }

    def _fetch_quotes_sync(self, symbols: list[str]) -> list[dict]:
        """The original logic that talks to yfinance (Now wrapped by cache)."""
        results = []
        try:
            tickers = yf.Tickers(" ".join(symbols))
            for symbol in symbols:
                try:
                    ticker = tickers.tickers[symbol]
                    info = ticker.fast_info
                    hist = ticker.history(period="2d", interval="1d")

                    prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else None
                    current = float(info.last_price) if info.last_price else None

                    change = None
                    change_pct = None
                    if current and prev_close:
                        change = round(current - prev_close, 4)
                        change_pct = round((change / prev_close) * 100, 4)

                    results.append({
                        "symbol": symbol,
                        "price": round(current, 2) if current else None,
                        "change": change,
                        "change_pct": change_pct,
                        "volume": int(info.three_month_average_volume or 0),
                        "market_cap": int(info.market_cap or 0),
                        "high": round(float(info.day_high), 2) if info.day_high else None,
                        "low": round(float(info.day_low), 2) if info.day_low else None,
                        "open": round(float(info.open), 2) if info.open else None,
                        "prev_close": round(prev_close, 2) if prev_close else None,
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                except Exception as e:
                    logger.warning(f"Failed to fetch {symbol}: {e}")
                    results.append({"symbol": symbol, "error": str(e)})
        except Exception as e:
            logger.error(f"Batch fetch failed: {e}")
        return results

    async def fetch_history(self, symbol: str, period: str = "1mo") -> list[dict]:
        """Fetch OHLCV history for charting."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._fetch_history_sync, symbol, period)

    def _fetch_history_sync(self, symbol: str, period: str) -> list[dict]:
        try:
            ticker = yf.Ticker(symbol)
            period_map = {
                "1d": ("1d", "5m"),
                "5d": ("5d", "15m"),
                "1mo": ("1mo", "1d"),
                "3mo": ("3mo", "1d"),
                "1y": ("1y", "1wk"),
            }
            yf_period, interval = period_map.get(period, ("1mo", "1d"))
            hist = ticker.history(period=yf_period, interval=interval)

            records = []
            for ts, row in hist.iterrows():
                records.append({
                    "time": ts.isoformat(),
                    "open": round(float(row["Open"]), 4),
                    "high": round(float(row["High"]), 4),
                    "low": round(float(row["Low"]), 4),
                    "close": round(float(row["Close"]), 4),
                    "volume": int(row["Volume"]),
                })
            return records
        except Exception as e:
            logger.error(f"History fetch failed for {symbol}: {e}")
            return []