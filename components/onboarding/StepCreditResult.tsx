'use client'

interface StepCreditResultProps {
  salary: number
  onNext: () => void
  onBack: () => void
}

export default function StepCreditResult({ salary, onNext, onBack }: StepCreditResultProps) {
  const maxCredit = salary * 3
  const monthlyRate = 0.028

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Resultado de tu crédito
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Basándonos en tu sueldo, este es el monto máximo preaprobado para ti.
        </p>
      </div>

      {/* Hero amount */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: '#2B2929' }}
      >
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Monto máximo aprobado</span>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-bold text-white">
            ${maxCredit.toLocaleString('es-MX')}
          </span>
          <span className="text-sm text-white/60">MXN</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span className="text-xs text-white/70">Preaprobado al instante</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tasa mensual', value: `${(monthlyRate * 100).toFixed(1)}%` },
          { label: 'Plazo máx.', value: '24 meses' },
          { label: 'Sin aval', value: '100%' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <span className="text-xs text-muted-foreground leading-tight">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#E1941F' }}
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
        >
          Regresar
        </button>
      </div>
    </div>
  )
}
