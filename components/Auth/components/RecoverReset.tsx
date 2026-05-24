import AuthLayout from "./AuthLayout";
import PasswordToggle from "./PasswordToggle";
import type { RecoverResetProps } from "../types";

export default function RecoverReset({
  recoveryEmail,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  resetError,
  recoveryLoading,
  setNewPassword,
  setConfirmPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  setResetError,
  setMode,
  handleResetPassword,
  onClose
}: RecoverResetProps) {
  return (
    <AuthLayout
      title="Crea una nueva contraseña"
      subtitle="Define una contraseña nueva para volver a iniciar sesion."
      onClose={onClose}
      children={
        <form onSubmit={handleResetPassword} className="flex flex-col gap-5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cuenta a actualizar
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{recoveryEmail}</p>
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
              <PasswordToggle
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                label={showConfirmPassword ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
              />
            </div>
            {resetError && <p className="text-xs text-destructive">{resetError}</p>}
          </div>

          <button
            type="submit"
            disabled={recoveryLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 bg-brand-accent"
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
      }
    />
  );
}
