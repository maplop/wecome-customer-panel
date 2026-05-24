import AuthLayout from "./AuthLayout";
import type { RecoverVerifyProps } from "../types";
import { maskEmail } from "../useAuth";

export default function RecoverVerify({
  recoveryEmail,
  recoveryCode,
  recoveryDigits,
  recoveryRefs,
  recoveryLoading,
  recoveryError,
  recoveryInfo,
  handleVerifyRecoveryCode,
  handleRecoveryDigitChange,
  handleRecoveryKeyDown,
  handleRecoveryPaste,
  handleResendRecoveryCode,
  setMode,
  onClose
}: RecoverVerifyProps) {
  return (
    <AuthLayout
      title="Verifica el codigo"
      subtitle="Captura el codigo que enviamos al correo registrado para continuar."
      onClose={onClose}
      children={
        <form onSubmit={handleVerifyRecoveryCode} className="flex flex-col gap-5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Correo verificado
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{maskEmail(recoveryEmail)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Codigo demo: <span className="font-mono text-foreground">{recoveryCode}</span>
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
            className="self-start text-sm font-medium transition hover:opacity-70 disabled:opacity-50 text-brand-accent"
          >
            Reenviar codigo
          </button>

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
      }
    />
  );
}
