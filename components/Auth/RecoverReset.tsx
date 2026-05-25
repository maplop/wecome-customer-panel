'use client'

import { useState } from "react"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard, TogglePasswordVisibility } from "@/components/common"

const RECOVERY_EMAIL = "maria.gonzalez@empresa.com"

export default function RecoverReset() {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetError, setResetError] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")

    if (!newPassword || !confirmPassword) {
      setResetError("Completa ambos campos.")
      return
    }
    if (newPassword.length < 8) {
      setResetError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden.")
      return
    }

    setRecoveryLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setRecoveryLoading(false)

    router.push(ROUTES.AUTH.LOGIN)
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Crea una nueva contraseña</TitleCard>
        <SubtitleCard>
          Define una contraseña nueva para volver a iniciar sesion.
        </SubtitleCard>
      </div>
      <form onSubmit={handleResetPassword} >
        <div className="flex flex-col gap-5">
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
              <TogglePasswordVisibility
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
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
              <TogglePasswordVisibility
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                label={showConfirmPassword ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
              />
            </div>
            {resetError && <p className="text-xs text-destructive">{resetError}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard
              submit
              disabled={recoveryLoading}
              loading={recoveryLoading}
              loadingText="Guardando..."
            >
              Actualizar contraseña
            </ButtonCard>
            <ButtonCard
              variant="secondary"
              onClick={() => router.back()}
            >
              Regresar
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
