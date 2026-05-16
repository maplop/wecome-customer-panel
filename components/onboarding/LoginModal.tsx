'use client'

import { useRef, useState } from 'react'

interface LoginModalProps {
  onClose: () => void
  onSuccess: (user: LoggedUser) => void
}

export interface LoggedUser {
  name: string
  email: string
  curp: string
}

type ViewMode = 'login' | 'recover-request' | 'recover-verify' | 'recover-reset'

const MOCK_USERS: Array<LoggedUser & { password: string }> = [
  {
    name: 'Maria Gonzalez Perez',
    email: 'maria.gonzalez@empresa.com',
    password: 'demo1234',
    curp: 'GOPM850312MDFNRR08',
  },
  {
    name: 'Carlos Ramirez Lopez',
    email: 'carlos.ramirez@empresa.com',
    password: 'demo1234',
    curp: 'RALC900715HDFLPR05',
  },
]

const RECOVERY_EMAIL = 'maria.gonzalez@empresa.com'
const RECOVERY_CODE = '123456'

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email

  const visible = user.slice(0, 2)
  const masked = '*'.repeat(Math.max(user.length - 2, 3))
  return `${visible}${masked}@${domain}`
}

function PasswordToggle({
  visible,
  onToggle,
  label,
}: {
  visible: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
      aria-label={label}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<ViewMode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [recoveryDigits, setRecoveryDigits] = useState(['', '', '', '', '', ''])
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [recoveryInfo, setRecoveryInfo] = useState('')
  const recoveryRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetError, setResetError] = useState('')

  const resetRecoveryState = () => {
    setMode('login')
    setRecoveryDigits(['', '', '', '', '', ''])
    setRecoveryLoading(false)
    setRecoveryError('')
    setRecoveryInfo('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setResetError('')
  }

  const handleClose = () => {
    resetRecoveryState()
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError('')
    setLoading(false)
    setSuccessMessage('')
    onClose()
  }

  const goToLogin = (message = '') => {
    resetRecoveryState()
    setEmail(RECOVERY_EMAIL)
    setPassword('')
    setShowPassword(false)
    setError('')
    setSuccessMessage(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email || !password) {
      setError('Completa todos los campos.')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 900))

    const match = MOCK_USERS.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
    )

    setLoading(false)

    if (!match) {
      setError('Correo o contraseña incorrectos.')
      return
    }

    onSuccess({ name: match.name, email: match.email, curp: match.curp })
  }

  const handleSendRecoveryCode = async () => {
    setRecoveryError('')
    setRecoveryInfo('')
    setRecoveryLoading(true)

    await new Promise(resolve => setTimeout(resolve, 900))

    setRecoveryLoading(false)
    setRecoveryInfo(`Enviamos un codigo de 6 digitos a ${maskEmail(RECOVERY_EMAIL)}.`)
    setMode('recover-verify')
  }

  const handleRecoveryDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const nextDigits = [...recoveryDigits]
    nextDigits[index] = value
    setRecoveryDigits(nextDigits)
    setRecoveryError('')

    if (value && index < recoveryRefs.length - 1) {
      recoveryRefs[index + 1].current?.focus()
    }
  }

  const handleRecoveryKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !recoveryDigits[index] && index > 0) {
      recoveryRefs[index - 1].current?.focus()
    }
  }

  const handleRecoveryPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedCode = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedCode.length !== 6) return

    setRecoveryDigits(pastedCode.split(''))
    setRecoveryError('')
    recoveryRefs[5].current?.focus()
  }

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = recoveryDigits.join('')
    if (code.length !== 6) {
      setRecoveryError('Ingresa los 6 digitos del codigo.')
      return
    }

    setRecoveryError('')
    setRecoveryLoading(true)

    await new Promise(resolve => setTimeout(resolve, 700))

    setRecoveryLoading(false)

    if (code !== RECOVERY_CODE) {
      setRecoveryError('El codigo no es valido. Usa 123456 para esta demo.')
      return
    }

    setMode('recover-reset')
  }

  const handleResendRecoveryCode = async () => {
    setRecoveryDigits(['', '', '', '', '', ''])
    setRecoveryError('')
    setRecoveryInfo('')
    setRecoveryLoading(true)

    await new Promise(resolve => setTimeout(resolve, 700))

    setRecoveryLoading(false)
    setRecoveryInfo(`Reenviamos el codigo a ${maskEmail(RECOVERY_EMAIL)}.`)
    recoveryRefs[0].current?.focus()
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')

    if (!newPassword || !confirmPassword) {
      setResetError('Completa ambos campos.')
      return
    }

    if (newPassword.length < 8) {
      setResetError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contrasenas no coinciden.')
      return
    }

    setRecoveryLoading(true)
    await new Promise(resolve => setTimeout(resolve, 900))
    setRecoveryLoading(false)

    const user = MOCK_USERS.find(item => item.email.toLowerCase() === RECOVERY_EMAIL.toLowerCase())
    if (user) {
      user.password = newPassword
    }

    goToLogin('Contraseña actualizada. Ahora puedes iniciar sesion con tu nueva contraseña.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <div className="flex flex-col gap-1">
            <h2 id="login-title" className="text-xl font-bold text-foreground">
              {mode === 'login' && 'Ingresa a tu cuenta'}
              {mode === 'recover-request' && 'Recupera tu contraseña'}
              {mode === 'recover-verify' && 'Verifica el codigo'}
              {mode === 'recover-reset' && 'Crea una nueva contraseña'}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mode === 'login' && 'Consulta el estado de tu solicitud activa.'}
              {mode === 'recover-request' && 'Enviaremos un codigo de 6 digitos al correo registrado para esta demo.'}
              {mode === 'recover-verify' && 'Captura el codigo que enviamos al correo registrado para continuar.'}
              {mode === 'recover-reset' && 'Define una contraseña nueva para volver a iniciar sesion.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {mode === 'login' && (
          <>
            <div className="mx-6 mt-4 rounded-xl border border-border bg-secondary/60 px-4 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Demo:</span> usa{' '}
                <span className="font-mono text-xs">maria.gonzalez@empresa.com</span>{' '}
                con contraseña <span className="font-mono text-xs">demo1234</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-6 pt-5" noValidate>
              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                  Correo electronico
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setError('')
                    setSuccessMessage('')
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setSuccessMessage('')
                      setMode('recover-request')
                    }}
                    className="text-xs font-medium transition hover:opacity-70"
                    style={{ color: '#E1941F' }}
                  >
                    Olvide mi contraseña
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      setError('')
                      setSuccessMessage('')
                    }}
                    className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
                  />
                  <PasswordToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword(value => !value)}
                    label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: '#E1941F' }}
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verificando...
                  </>
                ) : 'Iniciar sesion'}
              </button>
            </form>
          </>
        )}

        {mode === 'recover-request' && (
          <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
            <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Correo registrado para recuperacion
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{RECOVERY_EMAIL}</p>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Te enviaremos un codigo temporal de 6 digitos para validar tu identidad y permitir el cambio de contraseña.
            </p>

            <button
              type="button"
              onClick={handleSendRecoveryCode}
              disabled={recoveryLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#E1941F' }}
            >
              {recoveryLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Enviando codigo...
                </>
              ) : 'Enviar codigo'}
            </button>

            <button
              type="button"
              onClick={() => goToLogin()}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
            >
              Volver al login
            </button>
          </div>
        )}

        {mode === 'recover-verify' && (
          <form onSubmit={handleVerifyRecoveryCode} className="flex flex-col gap-5 px-6 pb-6 pt-5">
            <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Correo verificado
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{maskEmail(RECOVERY_EMAIL)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Codigo demo: <span className="font-mono text-foreground">{RECOVERY_CODE}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">
                Codigo de verificacion
              </label>
              <div className="flex gap-2" onPaste={handleRecoveryPaste}>
                {recoveryDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={recoveryRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleRecoveryDigitChange(index, e.target.value)}
                    onKeyDown={e => handleRecoveryKeyDown(index, e)}
                    className={`h-13 w-full rounded-xl border text-center text-lg font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${recoveryError ? 'border-destructive' : 'border-border'}`}
                    style={{ minWidth: 0 }}
                    aria-label={`Digito ${index + 1}`}
                  />
                ))}
              </div>
              {recoveryError && <p className="text-xs text-destructive">{recoveryError}</p>}
              {recoveryInfo && <p className="text-xs text-emerald-700">{recoveryInfo}</p>}
            </div>

            <button
              type="button"
              onClick={handleResendRecoveryCode}
              disabled={recoveryLoading}
              className="self-start text-sm font-medium transition hover:opacity-70 disabled:opacity-50"
              style={{ color: '#E1941F' }}
            >
              Reenviar codigo
            </button>

            <button
              type="submit"
              disabled={recoveryLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#E1941F' }}
            >
              {recoveryLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Validando...
                </>
              ) : 'Validar codigo'}
            </button>

            <button
              type="button"
              onClick={() => setMode('recover-request')}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
            >
              Regresar
            </button>
          </form>
        )}

        {mode === 'recover-reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5 px-6 pb-6 pt-5">
            <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cuenta a actualizar
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{RECOVERY_EMAIL}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimo 8 caracteres"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value)
                    setResetError('')
                  }}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${resetError ? 'border-destructive' : 'border-border'}`}
                />
                <PasswordToggle
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword(value => !value)}
                  label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value)
                    setResetError('')
                  }}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${resetError ? 'border-destructive' : 'border-border'}`}
                />
                <PasswordToggle
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(value => !value)}
                  label={showConfirmPassword ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
                />
              </div>
              {resetError && <p className="text-xs text-destructive">{resetError}</p>}
            </div>

            <button
              type="submit"
              disabled={recoveryLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#E1941F' }}
            >
              {recoveryLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Guardando...
                </>
              ) : 'Actualizar contraseña'}
            </button>

            <button
              type="button"
              onClick={() => setMode('recover-verify')}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
            >
              Regresar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
