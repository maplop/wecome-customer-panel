'use client'

interface StepUserConfirmProps {
  curp: string
  onNext: () => void
  onBack: () => void
  isVerified?: boolean
}

export default function StepUserConfirm({ curp, onNext, onBack, isVerified = true }: StepUserConfirmProps) {
  // Derive a display name from CURP (first 4 letters → initials)
  const firstName = curp.slice(0, 4)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Confirmación de usuario
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verificamos tu CURP en nuestro sistema. ¿Es correcta esta información?
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/50 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: '#2B2929' }}
          >
            {firstName.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CURP detectado</span>
            <span className="font-semibold text-foreground tracking-wider text-sm">{curp}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm font-medium text-foreground">Verificado en lista blanca</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                <span className="text-sm font-medium text-red-600">No verificado en lista blanca</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isVerified ? (
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
            style={{ backgroundColor: '#E1941F' }}
          >
            Iniciar solicitud
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition cursor-not-allowed opacity-50"
            style={{ backgroundColor: '#E1941F' }}
          >
            No puedes iniciar la solicitud
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
        >
          No soy yo, regresar
        </button>
      </div>
    </div>
  )
}
