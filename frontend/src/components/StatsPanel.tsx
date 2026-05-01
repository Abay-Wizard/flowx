import { useMarketStore } from '../store/marketStore'
import { Activity, BarChart2 } from 'lucide-react'

const fmt = (n: number | null, prefix = '$', digits = 2): string =>
  n == null
    ? '—'
    : `${prefix}${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

const fmtVol = (n: number): string => {
  if (!n) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return String(n)
}

const StatRow = ({
  label, value, color,
}: {
  label: string
  value: string
  color?: string
}) => (
  <div className="flex justify-between items-center py-2"
    style={{ borderBottom: '1px solid rgba(30,45,77,0.4)' }}>
    <span className="text-xs uppercase tracking-wider"
      style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
    <span className="text-xs sm:text-sm font-semibold"
      style={{ fontFamily: 'var(--font-mono)', color: color ?? 'var(--color-text)' }}>
      {value}
    </span>
  </div>
)

interface Props {
  /** When true, renders as a compact horizontal 2-col grid (used inside mobile Stats tab) */
  compact?: boolean
}

export default function StatsPanel({ compact = false }: Props) {
  const { quotes, selectedSymbol, wsStatus, lastUpdate } = useMarketStore()
  const q = quotes[selectedSymbol]
  const isUp = (q?.change_pct ?? 0) >= 0

  const statusColors: Record<string, string> = {
    connected:    'var(--color-green)',
    connecting:   'var(--color-gold)',
    disconnected: 'var(--color-muted)',
    error:        'var(--color-red)',
  }

  const stats = q
    ? [
        { label: 'Open',      value: fmt(q.open),                      color: undefined },
        { label: 'High',      value: fmt(q.high),                      color: 'var(--color-green)' },
        { label: 'Low',       value: fmt(q.low),                       color: 'var(--color-red)' },
        { label: 'Prev Close',value: fmt(q.prev_close),                 color: undefined },
        { label: 'Volume',    value: fmtVol(q.volume),                  color: undefined },
        { label: 'Change',    value: `${isUp?'+':''}${fmt(q.change,'',2)}`, color: isUp ? 'var(--color-green)' : 'var(--color-red)' },
        { label: 'Change %',  value: `${isUp?'+':''}${q.change_pct?.toFixed(2)??'—'}%`, color: isUp ? 'var(--color-green)' : 'var(--color-red)' },
      ]
    : []

  return (
    <div className="h-full flex flex-col gap-3">
      {/* WS status */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg"
        style={{ background: '#070b14', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{
            background: statusColors[wsStatus],
            boxShadow: wsStatus === 'connected' ? `0 0 6px var(--color-green)` : 'none',
          }} />
          <span className="text-xs uppercase tracking-widest font-medium"
            style={{ color: statusColors[wsStatus], fontFamily: 'var(--font-mono)' }}>
            {wsStatus}
          </span>
        </div>
        <Activity size={12} style={{ color: 'var(--color-muted)' }} />
      </div>

      {/* Stats */}
      <div className="rounded-xl p-3 sm:p-4 flex-1 overflow-y-auto"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={13} style={{ color: 'var(--color-accent)' }} />
          <span className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            {selectedSymbol} Stats
          </span>
        </div>

        {q ? (
          compact ? (
            // 2-col grid for mobile Stats tab
            <div className="grid grid-cols-2 gap-x-4">
              {stats.map(({ label, value, color }) => (
                <StatRow key={label} label={label} value={value} color={color} />
              ))}
            </div>
          ) : (
            stats.map(({ label, value, color }) => (
              <StatRow key={label} label={label} value={value} color={color} />
            ))
          )
        ) : (
          <div className="text-sm text-center py-6" style={{ color: 'var(--color-muted)' }}>
            Select a symbol
          </div>
        )}
      </div>

      {lastUpdate && (
        <p className="text-center text-xs pb-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          Updated {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
