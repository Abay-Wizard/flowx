import { create } from 'zustand'

export interface Quote {
  symbol: string
  price: number | null
  change: number | null
  change_pct: number | null
  volume: number
  market_cap: number
  high: number | null
  low: number | null
  open: number | null
  prev_close: number | null
  timestamp: string
  error?: string
}

export interface OHLCVPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type FlashDir = 'up' | 'down'

interface MarketState {
  quotes: Record<string, Quote>
  history: Record<string, OHLCVPoint[]>
  selectedSymbol: string
  wsStatus: WsStatus
  lastUpdate: string | null
  priceFlash: Record<string, FlashDir>
  mobileView: 'watchlist' | 'chart' | 'stats'

  setQuotes: (quotes: Quote[]) => void
  updateQuote: (quote: Quote) => void
  setHistory: (key: string, data: OHLCVPoint[]) => void
  setSelectedSymbol: (symbol: string) => void
  setWsStatus: (status: WsStatus) => void
  setLastUpdate: (ts: string) => void
  triggerFlash: (symbol: string, direction: FlashDir) => void
  setMobileView: (view: MarketState['mobileView']) => void
}

export const useMarketStore = create<MarketState>((set, get) => ({
  quotes: {},
  history: {},
  selectedSymbol: 'AAPL',
  wsStatus: 'disconnected',
  lastUpdate: null,
  priceFlash: {},
  mobileView: 'watchlist',

  setQuotes: (quotes) => {
    const existing = get().quotes
    const updated: Record<string, Quote> = {}
    const flashes: Record<string, FlashDir> = {}

    quotes.forEach((q) => {
      const prev = existing[q.symbol]
      if (prev?.price != null && q.price != null && prev.price !== q.price) {
        flashes[q.symbol] = q.price > prev.price ? 'up' : 'down'
      }
      updated[q.symbol] = q
    })

    set({ quotes: { ...existing, ...updated } })

    if (Object.keys(flashes).length > 0) {
      set({ priceFlash: flashes })
      setTimeout(() => set({ priceFlash: {} }), 900)
    }
  },

  updateQuote: (quote) => set((s) => ({ quotes: { ...s.quotes, [quote.symbol]: quote } })),

  setHistory: (key, data) => set((s) => ({ history: { ...s.history, [key]: data } })),

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  setWsStatus: (status) => set({ wsStatus: status }),

  setLastUpdate: (ts) => set({ lastUpdate: ts }),

  triggerFlash: (symbol, direction) => {
    set((s) => ({ priceFlash: { ...s.priceFlash, [symbol]: direction } }))
    setTimeout(() => {
      set((s) => {
        const f = { ...s.priceFlash }
        delete f[symbol]
        return { priceFlash: f }
      })
    }, 900)
  },

  setMobileView: (view) => set({ mobileView: view }),
}))
