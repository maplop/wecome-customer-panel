'use client'

import { useMemo, useState } from 'react'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, TogglePasswordVisibility } from '@/components/common'
import { isApiClientError } from '@/api/dynamicore/frontend'
import { changePassword } from '@/services/profile'
import { evaluatePasswordStrength } from '@/utils/password-strength'

export default function PasswordChange() {
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { score, label: strengthLabel, color: strengthColor } = useMemo(
    () => evaluatePasswordStrength(newPassword),
    [newPassword],
  )

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword) {
      setError('Ingresa tu contraseña actual.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Completa todos los campos.')
      return
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        currentPassword,
        newPassword,
      })

      router.push(ROUTES.AUTH.LOGIN)
    } catch (err) {
      if (isApiClientError(err)) {
        const rawType =
          typeof (err.data as { __type?: unknown })?.__type === 'string'
            ? String((err.data as { __type?: string }).__type)
            : ''

        if (rawType.includes('NotAuthorizedException')) {
          setError('La contraseña actual es incorrecta.')
        } else if (rawType.includes('InvalidPasswordException')) {
          setError('La nueva contraseña no cumple con la politica de seguridad.')
        } else if (rawType.includes('LimitExceededException')) {
          setError('Demasiados intentos. Intenta mas tarde.')
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
        <TitleCard>Cambia tu contraseña</TitleCard>
        <SubtitleCard>Ingresa tu contraseña actual y define una nueva.</SubtitleCard>
      </div>

      <form onSubmit={handleChangePassword}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="current-password" className="text-sm font-medium text-foreground">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setError('')
                }}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background ${error ? 'border-destructive' : 'border-border'}`}
              />
              <TogglePasswordVisibility
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
              />
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
                label={showConfirmPassword ? 'Ocultar confirmacion' : 'Mostrar confirmacion'}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard submit disabled={loading} loading={loading} loadingText="Guardando...">
              Actualizar contraseña
            </ButtonCard>
            <ButtonCard variant="secondary" onClick={() => router.back()} disabled={loading}>
              Regresar
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
