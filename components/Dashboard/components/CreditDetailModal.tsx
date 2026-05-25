'use client'
import { Check, CreditCard, X } from '@/lib/icons'
import { ButtonCard } from '@/components/common'


interface CreditDetailModalProps {
  credit: {
    id: string
    type: string
    amount: number
    biweeklyPayment: number
    totalPaid: number
    paymentDue: string
    paidPeriods: number
    totalPeriods: number
    status: 'activo' | 'finalizado'
  }
  onClose: () => void
  onPay: () => void
}

export default function CreditDetailModal({ credit, onClose, onPay }: CreditDetailModalProps) {
  const progress = Math.round((credit.paidPeriods / credit.totalPeriods) * 100)
  const isFinished = credit.status === 'finalizado'
  const remaining = credit.totalPeriods - credit.paidPeriods
  const totalAmount = credit.biweeklyPayment * credit.totalPeriods
  const remainingAmount = totalAmount - credit.totalPaid

  // Generate sample schedule
  const schedule = Array.from({ length: credit.totalPeriods }, (_, i) => {
    const isPaid = i < credit.paidPeriods
    const isCurrent = i === credit.paidPeriods
    const date = new Date()
    date.setDate(date.getDate() + (i - credit.paidPeriods) * 15)
    return {
      period: i + 1,
      amount: credit.biweeklyPayment,
      date: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      isPaid,
      isCurrent,
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark"
            >
              <CreditCard className="stroke-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Detalle del crédito</h2>
              <p className="text-xs text-muted-foreground font-mono">{credit.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
            aria-label="Cerrar"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isFinished
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isFinished ? 'bg-green-500' : 'bg-amber-500'}`} />
              {isFinished ? 'Finalizado' : 'Activo'}
            </span>
            <span className="text-xs text-muted-foreground">{credit.type}</span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Monto total</p>
              <p className="text-lg font-bold text-foreground">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Pago quincenal</p>
              <p className="text-lg font-bold text-foreground">
                ${credit.biweeklyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Total pagado</p>
              <p className="text-lg font-bold text-brand-accent">
                ${credit.totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Por pagar</p>
              <p className="text-lg font-bold text-foreground">
                ${remainingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progreso de pagos</span>
              <span className="text-sm font-semibold text-brand-accent">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isFinished ? 'var(--brand-dark)' : 'var(--brand-accent)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{credit.paidPeriods} pagos realizados</span>
              <span>{remaining} pagos restantes</span>
            </div>
          </div>

          {/* Payment schedule */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Calendario de pagos</h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 sticky top-0">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">Periodo</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">Fecha</th>
                      <th className="text-right py-2.5 px-4 text-xs font-semibold text-muted-foreground">Monto</th>
                      <th className="text-center py-2.5 px-4 text-xs font-semibold text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr
                        key={row.period}
                        className={`border-t border-border ${row.isCurrent ? 'bg-amber-50' : ''}`}
                      >
                        <td className="py-2.5 px-4 text-foreground font-medium">{row.period}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{row.date}</td>
                        <td className="py-2.5 px-4 text-foreground text-right">
                          ${row.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {row.isPaid ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              Pagado
                            </span>
                          ) : row.isCurrent ? (
                            <span className="inline-flex items-center gap-1 font-medium text-brand-accent">
                              Pendiente
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="px-6 py-4 border-t border-border shrink-0">
            <ButtonCard
              onClick={onPay}
            >
              Realizar pago de ${credit.biweeklyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </ButtonCard>
          </div>
        )}
      </div>
    </div>
  )
}
