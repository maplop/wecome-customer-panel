'use client'

interface StepSuccessProps {
  amount: number
  onRestart: () => void
}

export default function StepSuccess({ amount, onRestart }: StepSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#2B2929' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E1941F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground text-balance">
            ¡Solicitud enviada!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu solicitud de crédito por{' '}
            <strong className="text-foreground">${amount.toLocaleString('es-MX')} MXN</strong>{' '}
            ha sido recibida y está en proceso.
          </p>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-4 text-left">
        <p className="text-sm font-semibold text-foreground">¿Qué sigue?</p>
        <div className="flex flex-col gap-3">
          {[
            { step: '01', text: 'Recibirás un correo de confirmación en los próximos minutos.' },
            { step: '02', text: 'Un asesor revisará tu solicitud en un plazo de 24 horas.' },
            { step: '03', text: 'El depósito se realizará en máximo 2 días hábiles.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#E1941F' }}
              >
                {step}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
      >
        Volver al inicio
      </button>
    </div>
  )
}
