import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { useMarketStore, OHLCVPoint } from '../store/marketStore'
import { fetchHistory } from '../utils/api'
import { Loader2 } from 'lucide-react'

const PERIODS = ['1d', '5d', '1mo', '3mo', '1y'] as const
type Period = typeof PERIODS[number]

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtVol = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as OHLCVPoint
  const label = (() => {
    const dt = new Date(d.time)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  })()

  return (
    <div className="rounded-lg p-3 text-xs" style={{
      background: '#0f1629',
      border: '1px solid #1e2d4d',
      fontFamily: 'var(--font-mono)',
      minWidth: 148,
    }}>
      <div className="mb-2" style={{ color: 'var(--color-muted)' }}>{label}</div>
      <div className="space-y-1">
        {[
          { k: 'open',   label: 'O', color: 'var(--color-muted)' },
          { k: 'high',   label: 'H', color: 'var(--color-green)' },
          { k: 'low',    label: 'L', color: 'var(--color-red)' },
          { k: 'close',  label: 'C', color: 'var(--color-accent)' },
        ].map(({ k, label: l, color }) => {
          const val = d[k as keyof OHLCVPoint]
          if (val == null) return null
          return (
            <div key={k} className="flex justify-between gap-4">
              <span style={{ color }}>{l}</span>
              <span style={{ color: 'var(--color-text)' }}>${fmt(val as number)}</span>
            </div>
          )
        })}
        {d.volume != null && (
          <div className="flex justify-between gap-4 pt-1 mt-1"
            style={{ borderTop: '1px solid #1e2d4d' }}>
            <span style={{ color: 'var(--color-muted)' }}>Vol</span>
            <span style={{ color: 'var(--color-text)' }}>{fmtVol(d.volume)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PriceChart() {
  const { selectedSymbol, history, quotes, setHistory } = useMarketStore()
  const [period, setPeriod] = useState<Period>('1mo')
  const [loading, setLoading] = useState(false)

  const quote = quotes[selectedSymbol]
  const histKey = `${selectedSymbol}_${period}`
  const data: OHLCVPoint[] = history[histKey] ?? []
  const isUp = (quote?.change_pct ?? 0) >= 0
  const lineColor = isUp ? 'var(--color-green)' : 'var(--color-red)'

  useEffect(() => {
    if (history[histKey]) return
    setLoading(true)
    fetchHistory(selectedSymbol, period)
      .then(({ data: d }) => setHistory(histKey, d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedSymbol, period, histKey, history, setHistory])

  const formatXAxis = (tick: string) => {
    if (!tick) return ''
    const d = new Date(tick)
    if (period === '1d') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (period === '1y') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
            {selectedSymbol}
          </h2>
          {quote && (
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                ${quote.price?.toFixed(2) ?? '—'}
              </span>
              <span className="text-xs sm:text-sm font-medium"
                style={{ color: isUp ? 'var(--color-green)' : 'var(--color-red)' }}>
                {isUp ? '+' : ''}{quote.change?.toFixed(2)}{' '}
                ({isUp ? '+' : ''}{quote.change_pct?.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Period selector — scrollable on very small screens */}
        <div className="flex gap-1 p-1 rounded-lg self-start sm:self-auto overflow-x-auto"
          style={{ background: '#0a0e1a', border: '1px solid var(--color-border)' }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all shrink-0"
              style={{
                background: period === p ? 'var(--color-accent)' : 'transparent',
                color: period === p ? '#0a0e1a' : 'var(--color-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm"
          style={{ color: 'var(--color-muted)' }}>
          No data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1 min-h-0">
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4d" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="close"
                  stroke={lineColor} strokeWidth={1.5}
                  fill="url(#priceGrad)" dot={false}
                  activeDot={{ r: 3, fill: lineColor, stroke: '#0a0e1a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume bar */}
          <div style={{ height: 48 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                <Bar dataKey="volume" fill={`${lineColor}44`} radius={[1, 1, 0, 0]} />
                <YAxis hide domain={['auto', 'auto']} />
                <XAxis hide dataKey="time" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
