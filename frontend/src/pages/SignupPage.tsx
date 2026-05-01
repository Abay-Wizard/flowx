import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { TrendingUp, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import AuthInput from '../components/AuthInput'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.')
      return
    }

    const ok = await register(username, email, password)
    if (ok) setSuccess(true)
  }

  const displayError = localError || error

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: '#00e67618', border: '1px solid #00e67644' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-green)' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            You're all set. Sign in to access your dashboard.
          </p>
          <Link to="/login"
            className="inline-block w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase text-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
              color: '#0a0e1a',
            }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: 'var(--color-bg)' }}>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div className="hidden sm:block absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)', filter: 'blur(80px)' }} />
      <div className="hidden sm:block absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Create account</h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Start streaming live market data today
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 0 40px rgba(0,212,255,0.05)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Username"
              icon={<User size={14} />}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); setLocalError('') }}
              placeholder="choose a username"
              autoComplete="username"
              required
            />
            <AuthInput
              label="Email"
              icon={<Mail size={14} />}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError('') }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <AuthInput
              label="Password"
              icon={<Lock size={14} />}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError('') }}
              placeholder="min. 8 characters"
              autoComplete="new-password"
              required
            />
            <AuthInput
              label="Confirm Password"
              icon={<Lock size={14} />}
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setLocalError('') }}
              placeholder="repeat your password"
              autoComplete="new-password"
              required
            />

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{
                    background: password.length >= i * 3
                      ? i <= 1 ? 'var(--color-red)'
                        : i <= 2 ? 'var(--color-gold)'
                          : 'var(--color-green)'
                      : 'var(--color-border)'
                  }} />
                ))}
              </div>
            )}

            {displayError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: '#ff174411', border: '1px solid #ff174433', color: '#ff5177' }}>
                <AlertCircle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase transition-opacity disabled:opacity-50 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
                color: '#0a0e1a',
              }}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login"
            className="font-semibold transition-colors hover:underline"
            style={{ color: 'var(--color-accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
