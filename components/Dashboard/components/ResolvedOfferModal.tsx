'use client'

import { useEffect } from 'react'
import { X, CheckCircle } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'

interface ResolvedOfferModalProps {
  credit: ClientRequestRecord
  onClose: () => void
  onAccept: () => void
}

function formatMoney(n: number) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function ResolvedOfferModal({ credit, onClose, onAccept }: ResolvedOfferModalProps) {
  // Datos mockeados para la oferta
  const mockOffer = {
    monto: 50000,
    tasaMensual: 4.2,
    plazo: 18,
    comisionApertura: 3.5,
    cuotaMensual: 2800,
    totalAPagar: 50400,
  }

  const data = credit.data
  const solicitadoMonto = Number(data.monto_solicitado ?? mockOffer.monto)
  const solicitado = formatMoney(solicitadoMonto)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
              <CheckCircle className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">¡Tu crédito fue aprobado!</p>
              <p className="text-xs text-muted-foreground">Oferta disponible</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
          >
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">

          {/* Monto principal */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
            <span className="text-xs text-muted-foreground">Monto aprobado</span>
            <span className="text-3xl font-bold text-foreground">{solicitado}</span>
            <p className="text-xs text-muted-foreground mt-1">Disponible inmediatamente en tu cuenta</p>
          </div>

          {/* Detalles de la oferta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
              <span className="text-xs text-muted-foreground">Plazo</span>
              <span className="text-lg font-semibold text-foreground">{mockOffer.plazo} meses</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
              <span className="text-xs text-muted-foreground">Tasa mensual</span>
              <span className="text-lg font-semibold text-foreground">{mockOffer.tasaMensual}%</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
              <span className="text-xs text-muted-foreground">Comisión de apertura</span>
              <span className="text-lg font-semibold text-foreground">{mockOffer.comisionApertura}%</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
              <span className="text-xs text-muted-foreground">Cuota mensual</span>
              <span className="text-lg font-semibold text-foreground">{formatMoney(mockOffer.cuotaMensual)}</span>
            </div>
          </div>

          {/* Resumen */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Monto a desembolsar</span>
              <span className="font-semibold text-foreground">{solicitado}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Total con intereses</span>
              <span className="font-semibold text-foreground">{formatMoney(mockOffer.totalAPagar)}</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total a pagar</span>
              <span className="text-lg font-bold text-brand-accent">{formatMoney(mockOffer.totalAPagar)}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-accent/5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 bg-brand-accent/20 text-brand-accent text-xs font-bold">i</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Al aceptar esta oferta, autorizas el desembolso del crédito en tu cuenta registrada. Tendrás 30 días para cambiar de opinión sin penalidad.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium text-sm"
          >
            Revisar después
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm"
          >
            Aceptar oferta
          </button>
        </div>

      </div>
    </div>
  )
}
