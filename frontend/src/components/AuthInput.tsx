import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, ...props }, ref) => {
    return (
      <div>
        <label
          className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
          style={{ color: 'var(--color-muted)' }}
        >
          {label}
        </label>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-muted)' }}
          >
            {icon}
          </span>
          <input
            ref={ref}
            {...props}
            className="auth-input w-full pl-9 pr-4 py-3 rounded-lg text-sm"
          />
        </div>
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'
export default AuthInput