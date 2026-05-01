import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { TrendingUp, Lock, User, Zap, AlertCircle } from 'lucide-react'
import AuthInput from '../components/AuthInput'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, demoLogin, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await login(username, password)
  }

  const handleUsername = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    clearError()
  }

  const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: 'var(--color-bg)' }}>

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)', filter: 'blur(80px)' }} />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00e676, transparent)', filter: 'blur(80px)' }} />

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center glow-accent"
              style={{ background: 'linear-gradient(135deg, #00d4ff22, #00d4ff44)', border: '1px solid #00d4ff66' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              FLOWX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Real-time financial data dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 0 40px rgba(0,212,255,0.05)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <AuthInput
              label="Username"
              icon={<User size={14} />}
              type="text"
              value={username}
              onChange={handleUsername}
              placeholder="your username"
              autoComplete="username"
              required
            />
            <AuthInput
              label="Password"
              icon={<Lock size={14} />}
              type="password"
              value={password}
              onChange={handlePassword}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: '#ff174411', border: '1px solid #ff174433', color: '#ff5177' }}>
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase transition-opacity disabled:opacity-50 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                color: '#0a0e1a',
              }}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--color-border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
                or
              </span>
            </div>
          </div>

          <button
            onClick={demoLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-accent)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <Zap size={14} />
            Launch Demo
          </button>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--color-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup"
            className="font-semibold transition-colors hover:underline"
            style={{ color: 'var(--color-accent)' }}>
            Create one
          </Link>
        </p>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
          Live data via Yahoo Finance · WebSocket streaming · JWT secured
        </p>
      </div>
    </div>
  )
}