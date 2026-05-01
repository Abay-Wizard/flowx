import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useMarketStore } from '../store/marketStore'
import { useMarketWebSocket } from '../hooks/useMarketWebSocket'
import QuoteCard from '../components/QuoteCard'
import PriceChart from '../components/PriceChart'
import StatsPanel from '../components/StatsPanel'
import {
  LogOut, TrendingUp, RefreshCw, LayoutList, LineChart, BarChart2,
  Menu, X,
} from 'lucide-react'
import { fetchQuotes } from '../utils/api'

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']

type MobileTab = 'watchlist' | 'chart' | 'stats'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { username, logout, isAuthenticated } = useAuthStore()
  const { quotes, setQuotes, setSelectedSymbol, selectedSymbol, wsStatus } = useMarketStore()
  const [mobileTab, setMobileTab] = useState<MobileTab>('watchlist')
  const [menuOpen, setMenuOpen] = useState(false)

  useMarketWebSocket()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (Object.keys(quotes).length === 0) {
      fetchQuotes()
        .then(({ data }) => setQuotes(data))
        .catch(console.error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const handleRefresh = () => {
    fetchQuotes().then(({ data }) => setQuotes(data)).catch(console.error)
  }

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym)
    setMobileTab('chart')   // auto-switch to chart on mobile when picking a symbol
  }

  const wsStatusColor =
    wsStatus === 'connected'    ? 'var(--color-green)' :
    wsStatus === 'connecting'   ? 'var(--color-gold)'  :
    wsStatus === 'error'        ? 'var(--color-red)'   :
                                  'var(--color-muted)'

  const SkeletonCard = () => (
    <div className="rounded-xl p-3 sm:p-4 animate-pulse"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', height: 84 }} />
  )

  return (
    <div className="scanlines flex flex-col" style={{ height: '100dvh', background: 'var(--color-bg)' }}>

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 shrink-0 z-20"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>

        {/* Left — Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d4ff22, #00d4ff44)', border: '1px solid #00d4ff55' }}>
            <TrendingUp size={14} style={{ color: 'var(--color-accent)' }} />
          </div>
          <span className="font-bold tracking-wider text-sm"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
            FLOWX
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded hidden xs:inline-block"
            style={{
              background: '#00d4ff0d', color: 'var(--color-muted)',
              border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)',
            }}>
            LIVE
          </span>
        </div>

        {/* Right — Desktop controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* WS status pill */}
          <div className="flex items-center gap-1.5 text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: wsStatusColor,
              boxShadow: wsStatus === 'connected' ? `0 0 5px var(--color-green)` : 'none',
            }} />
            WS {wsStatus}
          </div>

          <button onClick={handleRefresh}
            className="p-1.5 rounded-lg transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            title="Refresh quotes">
            <RefreshCw size={13} />
          </button>

          <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            {username}
          </span>

          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-red)'
              e.currentTarget.style.color = 'var(--color-red)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-muted)'
            }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>

        {/* Right — Mobile hamburger */}
        <button className="sm:hidden p-1.5 rounded-lg"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden z-30 px-4 py-3 flex flex-col gap-2 shrink-0"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: wsStatusColor }} />
              WS {wsStatus}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              {username}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { handleRefresh(); setMenuOpen(false) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
              style={{ border: '1px solid #ff174433', color: 'var(--color-red)' }}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP LAYOUT (sm+) ────────────────────────── */}
      <div className="hidden sm:flex flex-1 overflow-hidden min-h-0">
        {/* Left sidebar — watchlist */}
        <aside className="w-48 lg:w-52 shrink-0 flex flex-col gap-2 p-3 overflow-y-auto"
          style={{ borderRight: '1px solid var(--color-border)' }}>
          <p className="text-xs uppercase tracking-widest px-1 mb-1 shrink-0"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            Watchlist
          </p>
          {SYMBOLS.map((sym) => {
            const q = quotes[sym]
            return q
              ? <QuoteCard key={sym} quote={q} selected={selectedSymbol === sym} onClick={() => setSelectedSymbol(sym)} />
              : <SkeletonCard key={sym} />
          })}
        </aside>

        {/* Center — chart */}
        <main className="flex-1 p-4 lg:p-5 overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 rounded-2xl p-4 lg:p-5 min-h-0"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <PriceChart />
          </div>
        </main>

        {/* Right sidebar — stats */}
        <aside className="w-52 lg:w-56 shrink-0 p-3 lg:p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--color-border)' }}>
          <StatsPanel />
        </aside>
      </div>

      {/* ── MOBILE LAYOUT (<sm) ─────────────────────────── */}
      <div className="flex sm:hidden flex-1 flex-col overflow-hidden min-h-0">

        {/* Mobile content area */}
        <div className="flex-1 overflow-hidden min-h-0">

          {/* Watchlist tab */}
          {mobileTab === 'watchlist' && (
            <div className="h-full overflow-y-auto p-3 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-widest px-1 mb-1 shrink-0"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Watchlist
              </p>
              {SYMBOLS.map((sym) => {
                const q = quotes[sym]
                return q
                  ? <QuoteCard key={sym} quote={q} selected={selectedSymbol === sym} onClick={() => handleSelectSymbol(sym)} />
                  : <SkeletonCard key={sym} />
              })}
            </div>
          )}

          {/* Chart tab */}
          {mobileTab === 'chart' && (
            <div className="h-full flex flex-col p-3 gap-2">
              {/* Horizontal symbol strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 shrink-0" style={{ scrollbarWidth: 'none' }}>
                {SYMBOLS.map((sym) => {
                  const q = quotes[sym]
                  return q
                    ? <QuoteCard key={sym} quote={q} selected={selectedSymbol === sym} onClick={() => setSelectedSymbol(sym)} compact />
                    : <div key={sym} className="shrink-0 rounded-xl animate-pulse"
                        style={{ width: 90, height: 72, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
                })}
              </div>

              {/* Chart card */}
              <div className="flex-1 rounded-2xl p-3 min-h-0"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <PriceChart />
              </div>
            </div>
          )}

          {/* Stats tab */}
          {mobileTab === 'stats' && (
            <div className="h-full overflow-y-auto p-3">
              <StatsPanel compact />
            </div>
          )}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="shrink-0 pb-safe"
          style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="flex">
            {(
              [
                { id: 'watchlist', label: 'Watchlist', Icon: LayoutList },
                { id: 'chart',     label: 'Chart',     Icon: LineChart },
                { id: 'stats',     label: 'Stats',     Icon: BarChart2 },
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = mobileTab === id
              return (
                <button
                  key={id}
                  onClick={() => setMobileTab(id)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                  style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                  <Icon size={18} />
                  <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                    {label}
                  </span>
                  {active && (
                    <div className="absolute bottom-0 w-8 h-0.5 rounded-t"
                      style={{ background: 'var(--color-accent)' }} />
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
