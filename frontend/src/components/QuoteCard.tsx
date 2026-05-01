import { useMarketStore, Quote } from '../store/marketStore'
import clsx from 'clsx'

const fmt = (n: number | null, digits = 2): string =>
  n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const fmtMktCap = (n: number): string => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  return `$${n}`
}

interface Props {
  quote: Quote
  selected: boolean
  onClick: () => void
  compact?: boolean  // mobile horizontal list mode
}

export default function QuoteCard({ quote, selected, onClick, compact = false }: Props) {
  const priceFlash = useMarketStore((s) => s.priceFlash[quote.symbol])
  const isUp = (quote.change_pct ?? 0) >= 0
  const changeColor = isUp ? 'var(--color-green)' : 'var(--color-red)'

  // Compact mode: horizontal pill for mobile bottom nav list
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={clsx(
          'shrink-0 flex flex-col items-start px-3 py-2.5 rounded-xl transition-all duration-200',
          priceFlash === 'up' && 'flash-up',
          priceFlash === 'down' && 'flash-down',
        )}
        style={{
          background: selected ? '#0f1e3a' : 'var(--color-surface)',
          border: selected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
          minWidth: 90,
        }}
      >
        <span className="text-xs font-bold tracking-wider mb-1"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
          {quote.symbol}
        </span>
        <span className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
          ${fmt(quote.price)}
        </span>
        <span className="text-xs mt-0.5"
          style={{ color: changeColor, fontFamily: 'var(--font-mono)' }}>
          {isUp ? '+' : ''}{fmt(quote.change_pct)}%
        </span>
      </button>
    )
  }

  // Full card — sidebar / desktop
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full text-left rounded-xl p-3 sm:p-4 transition-all duration-200',
        priceFlash === 'up' && 'flash-up',
        priceFlash === 'down' && 'flash-down',
      )}
      style={{
        background: selected ? '#0f1e3a' : 'var(--color-surface)',
        border: selected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        boxShadow: selected ? '0 0 20px rgba(0,212,255,0.1)' : 'none',
      }}
    >
      {selected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r"
          style={{ background: 'var(--color-accent)' }} />
      )}

      <div className="flex items-start justify-between mb-1.5">
        <span className="text-xs font-bold tracking-wider"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
          {quote.symbol}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ background: `${changeColor}22`, color: changeColor, fontFamily: 'var(--font-mono)' }}>
          {isUp ? '+' : ''}{fmt(quote.change_pct)}%
        </span>
      </div>

      <div className="text-lg font-bold mb-1.5"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
        ${fmt(quote.price)}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: changeColor, fontFamily: 'var(--font-mono)' }}>
          {isUp ? '▲' : '▼'} {fmt(Math.abs(quote.change ?? 0))}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          {fmtMktCap(quote.market_cap)}
        </span>
      </div>
    </button>
  )
}
