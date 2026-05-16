import AuthLayout from "./AuthLayout"
import PasswordToggle from "./PasswordToggle"
import type { LoginProps } from "../types"

export default function Login({ email, password, showPassword, error, loading, successMessage, setEmail, setPassword, setShowPassword, setError, setSuccessMessage, handleSubmit, setMode }: LoginProps) {
  return (
    <AuthLayout
      title="Ingresa a tu cuenta"
      subtitle="Consulta el estado de tu solicitud activa."
      children={
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
                  onToggle={() => setShowPassword(!showPassword)}
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
      }
    />
  )
}
