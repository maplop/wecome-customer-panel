import AuthLayout from "./AuthLayout";
import type { RecoverRequestProps } from "../types";

export default function RecoverRequest({
  recoveryEmail,
  recoveryLoading,
  handleSendRecoveryCode,
  goToLogin,
}: RecoverRequestProps) {
  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Enviaremos un codigo de 6 digitos al correo registrado para esta demo."
      children={
        <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Correo registrado para recuperacion
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{recoveryEmail}</p>
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
      }
    />
  );
}
