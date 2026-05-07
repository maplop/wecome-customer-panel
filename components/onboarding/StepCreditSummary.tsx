'use client'

interface StepCreditSummaryProps {
  amount: number
  term: number
  onNext: () => void
  onBack: () => void
}

const MONTHLY_RATE = 0.028
const COMMISSION_RATE = 0.02

export default function StepCreditSummary({ amount, term, onNext, onBack }: StepCreditSummaryProps) {
  const commission = Math.round(amount * COMMISSION_RATE)
  const netAmount = amount - commission
  const totalInterest = Math.round(amount * MONTHLY_RATE * term)
  const totalPayment = amount + totalInterest
  const biweeklyPayment = totalPayment / (term * 2)

  // Generate amortization table (biweekly periods)
  const periods = term * 2
  const rows = Array.from({ length: periods }, (_, i) => {
    const period = i + 1
    const balance = amount * (1 - (period / periods))
    const principal = biweeklyPayment - (balance * MONTHLY_RATE / 2)
    const interestPay = biweeklyPayment - Math.max(0, principal)
    return {
      period,
      payment: biweeklyPayment,
      principal: Math.max(0, principal),
      interest: interestPay,
      balance: Math.max(0, balance),
    }
  })

  const summaryRows = [
    { label: 'Monto solicitado', value: `$${amount.toLocaleString('es-MX')}` },
    { label: 'Comisión por apertura', value: `$${commission.toLocaleString('es-MX')}` },
    { label: 'Monto a recibir', value: `$${netAmount.toLocaleString('es-MX')}`, highlight: true },
    { label: 'Pago quincenal', value: `$${biweeklyPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`, highlight: true },
    { label: 'Intereses totales', value: `$${totalInterest.toLocaleString('es-MX')}` },
    { label: 'Total a pagar', value: `$${totalPayment.toLocaleString('es-MX')}` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Resumen del crédito
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Revisa todos los detalles antes de continuar con tu solicitud.
        </p>
      </div>

      {/* Summary details */}
      <div className="rounded-2xl border border-border overflow-hidden">
        {summaryRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-3 ${i < summaryRows.length - 1 ? 'border-b border-border' : ''} ${row.highlight ? 'bg-secondary/40' : 'bg-background'}`}
          >
            <span className={`text-sm ${row.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{row.label}</span>
            <span className={`text-sm font-semibold ${row.highlight ? 'text-foreground' : 'text-foreground'}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Amortization table */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Tabla de amortización</p>
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-secondary px-3 py-2">
            {['Quincena', 'Pago', 'Capital', 'Saldo'].map(h => (
              <span key={h} className="text-xs font-medium text-muted-foreground text-right first:text-left">{h}</span>
            ))}
          </div>
          {/* Rows - scrollable */}
          <div className="max-h-48 overflow-y-auto divide-y divide-border">
            {rows.map((row) => (
              <div key={row.period} className="grid grid-cols-4 px-3 py-2.5 hover:bg-secondary/30 transition">
                <span className="text-xs text-foreground">{row.period}</span>
                <span className="text-xs text-foreground text-right">${row.payment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                <span className="text-xs text-foreground text-right">${row.principal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                <span className="text-xs text-foreground text-right">${row.balance.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#E1941F' }}
        >
          Continuar con mi crédito
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
