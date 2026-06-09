'use client'

import { useMemo, useRef, useState } from 'react'
import {
  WrapperCard,
  TitleCard,
  SubtitleCard,
  ButtonCard,
  TogglePasswordVisibility,
} from '@/components/common'
import { ROUTES } from '@/lib/routes'
import { useRouter, useSearchParams } from 'next/navigation'
import { isApiClientError } from '@/api/dynamicore/frontend'
import { confirmForgotPassword, forgotPassword } from '@/services/auth'
import { evaluatePasswordStrength } from '@/utils/password-strength'

export default function RecoverVerify() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryEmail = searchParams.get('email')?.trim() || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const refs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])
  const { score, label: strengthLabel, color: strengthColor } = useMemo(
    () => evaluatePasswordStrength(newPassword),
    [newPassword],
  )

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')
    if (value && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length !== 6) return
    setDigits(pasted.split(''))
    setError('')
    refs.current[5]?.focus()
  }

  const handleResend = async () => {
    if (!recoveryEmail) {
      setError('Falta el correo del proceso de recuperacion. Vuelve a solicitar el codigo.')
      return
    }

    setDigits(['', '', '', '', '', ''])
    setError('')
    setInfo('')
    setLoading(true)

    try {
      await forgotPassword({ username: recoveryEmail })
      setInfo(`Reenviamos el codigo a ${recoveryEmail}`)
      refs.current[0]?.focus()
    } catch (err) {
      if (isApiClientError(err)) {
        const rawType =
          typeof (err.data as { __type?: unknown })?.__type === 'string'
            ? String((err.data as { __type?: string }).__type)
            : ''

        if (rawType.includes('UserNotFoundException')) {
          setError('No encontramos una cuenta con ese correo.')
        } else if (rawType.includes('LimitExceededException')) {
          setError('Has intentado demasiadas veces. Intenta de nuevo mas tarde.')
        } else {
          setError(err.apiDetail || err.apiMessage || err.apiError || err.message)
        }
      } else {
        setError('No fue posible reenviar el código. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recoveryEmail) {
      setError('Falta el correo del proceso de recuperación. Vuelve a solicitar el código .')
      return
    }

    const code = digits.join('')
    if (code.length !== 6) {
      setError('Ingresa los 6 digitos.')
      return
    }

    if (!newPassword) {
      setError('Ingresa una nueva contraseña.')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (!confirmPassword) {
      setError('Confirma la nueva contraseña.')
      return
    }

    if (confirmPassword !== newPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setError('')
    setInfo('')

    try {
      await confirmForgotPassword({
        username: recoveryEmail,
        code,
        password: newPassword,
      })

      router.push(ROUTES.AUTH.LOGIN)
    } catch (err) {
      if (isApiClientError(err)) {
        const rawType =
          typeof (err.data as { __type?: unknown })?.__type === 'string'
            ? String((err.data as { __type?: string }).__type)
            : ''

        if (rawType.includes('CodeMismatchException')) {
          setError('El código es incorrecto. Verifícalo e intenta de nuevo.')
        } else if (rawType.includes('ExpiredCodeException')) {
          setError('El código expiró. Solicita uno nuevo.')
        } else if (rawType.includes('InvalidPasswordException')) {
          setError('La contraseña no cumple con la política de seguridad.')
        } else if (rawType.includes('UserNotFoundException')) {
          setError('No encontramos una cuenta con ese correo.')
        } else {
          setError(err.apiDetail || err.apiMessage || err.apiError || err.message)
        }
      } else {
        setError('No fue posible actualizar la contraseña. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Código de verificación</TitleCard>
        <SubtitleCard>
          Ingresa el código de 6 dígitos que enviamos a: <strong>{recoveryEmail}</strong>
        </SubtitleCard>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">Código de verificación</label>
            <div className="flex gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    refs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-13 w-full rounded-xl border text-center text-lg font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border'}`}
                  style={{ minWidth: 0 }}
                  aria-label={`Digito ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-sm font-medium text-foreground">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
              />
              <TogglePasswordVisibility
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
              />
            </div>
            {newPassword && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{ backgroundColor: i <= score ? strengthColor : 'var(--brand-inactive)' }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
              />
              <TogglePasswordVisibility
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {info && <p className="text-xs text-emerald-700">{info}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard
              variant="text"
              onClick={handleResend}
              disabled={loading}
              loading={loading}
              loadingText="Reenviando..."
            >
              Reenviar código
            </ButtonCard>
            <ButtonCard submit disabled={loading} loading={loading} loadingText="Guardando...">
              Cambiar contraseña
            </ButtonCard>
            <ButtonCard variant="secondary" onClick={() => router.push(ROUTES.AUTH.LOGIN)}>
              Regresar
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
