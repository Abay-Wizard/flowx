import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useMarketStore } from '../store/marketStore'

const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000'
const RECONNECT_DELAY = 3000

export function useMarketWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { setQuotes, setWsStatus, setLastUpdate } = useMarketStore()

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setWsStatus('connecting')
    const ws = new WebSocket(`${WS_BASE}/ws?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
    }

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(event.data) as { type: string; data: Parameters<typeof setQuotes>[0]; timestamp: string }
        if (msg.type === 'initial_snapshot' || msg.type === 'quote_update') {
          setQuotes(msg.data)
          setLastUpdate(msg.timestamp)
        }
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = (event: CloseEvent) => {
      setWsStatus('disconnected')
      if (event.code !== 1000 && isAuthenticated) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }

    ws.onerror = () => {
      setWsStatus('error')
    }
  }, [token, isAuthenticated, setQuotes, setWsStatus, setLastUpdate])

  // Heartbeat ping every 30s
  useEffect(() => {
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      wsRef.current?.close(1000)
    }
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close(1000)
    }
  }, [isAuthenticated, connect])
}
