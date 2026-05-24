'use client'

import { useState } from 'react'

interface PaymentModalProps {
  amount: number
  onClose: () => void
  onSuccess: () => void
}

type PaymentMethod = 'spei' | 'bbva' | 'efectivo' | null

export default function PaymentModal({ amount, onClose, onSuccess }: PaymentModalProps) {
  const [customAmount, setCustomAmount] = useState(amount)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentMethods = [
    {
      id: 'spei' as const,
      label: 'SPEI',
      title: 'Transferencia',
      subtitle: 'El pago se ve reflejado en minutos',
    },
    {
      id: 'bbva' as const,
      label: 'BBVA',
      title: 'BBVA',
      subtitle: 'El pago se ve reflejado en minutos',
    },
    {
      id: 'efectivo' as const,
      label: 'Efectivo',
      title: 'Efectivo en tiendas físicas',
      subtitle: 'Paga en alguna de nuestras tiendas afiliadas',
    },
  ]

  const handleSubmit = () => {
    if (!selectedMethod) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Personaliza tu pago</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Amount card */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-foreground">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        autoFocus
                        className="text-xl font-bold text-foreground bg-transparent border-b-2 border-accent w-28 outline-none"
                        min={1}
                        step={0.01}
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-foreground">
                      ${customAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Realizarás tu pago por esta cantidad</span>
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
                  aria-label="Editar monto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex flex-col gap-3">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center justify-between rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-2 bg-secondary/60'
                      : 'border-border bg-card hover:bg-secondary/30'
                  }`}
                  className={isSelected ? 'border-brand-accent' : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <span className="text-xs font-bold text-foreground">{method.label}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-foreground">{method.title}</span>
                      <span className="text-xs text-muted-foreground">{method.subtitle}</span>
                    </div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMethod || isProcessing}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-brand-dark"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </>
            ) : (
              'Realizar pago'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
