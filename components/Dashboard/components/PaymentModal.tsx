'use client'

import { useState } from 'react'
import { Check, CircleDollarSign, X, Pencil } from '@/lib/icons'
import { ButtonCard } from '@/components/common'


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
            <X />
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
                  <CircleDollarSign className="stroke-white" />
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
                  <Pencil className="text-muted-foreground w-5 h-5" />
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
                  className={`flex items-center justify-between rounded-xl border p-4 transition ${isSelected
                    ? 'border-2 border-brand-accent bg-secondary/60'
                    : 'border-border bg-card hover:bg-secondary/30'
                    }`}
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
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <ButtonCard
            onClick={handleSubmit}
            disabled={!selectedMethod || isProcessing}
            loading={isProcessing}
            loadingText='  Procesando...'
          >
            Realizar pago
          </ButtonCard>
        </div>
      </div>
    </div>
  )
}
