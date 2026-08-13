'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CircleDollarSign, Calendar, ShieldCheck, CalendarClock, CalendarDays, Shield } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'
import { formatMoney, formatPaymentFrequency } from '@/utils/formatters'
import { getCreditTypeLabel, isProtectedCredit } from '@/utils/credit-type'
import { FactCard } from '@/components/common/CreditDetails'

interface DeniedRequestModalProps {
  credit: ClientRequestRecord
  onClose: () => void
}


export default function DeniedRequestModal({ credit, onClose }: DeniedRequestModalProps) {
  const data = credit.data

  const solicitado = Number(data.monto_solicitado ?? 0)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_solicitada)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }

  }, [])

  const TipoIcon = isProtectedCredit(data.tipo_de_credito_solicitado) ? ShieldCheck : Shield


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
              <AlertCircle className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Tu solicitud no fue aprobada</p>
              <p className="text-xs text-muted-foreground">Denegada</p>
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
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Hero */}
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark">
            <div className="flex justify-center items-center w-10 h-10 rounded-full bg-brand-accent">
              <X className="stroke-brand-dark w-8 h-8" />
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
              Estado de la solicitud
            </span>
            <span className="text-4xl font-bold text-white">
              DENEGADA
            </span>
            <p className="text-sm text-white/70 leading-relaxed">
              Tu solicitud no cumplió con los requisitos necesarios para su aprobación en este momento.
            </p>
          </div>

          <section className="grid grid-cols-2 gap-3">
            <FactCard
              label="Monto solicitado"
              value={formatMoney(solicitado)}
              icon={<CircleDollarSign className="h-4 w-4" />}
            />
            <FactCard
              label="Frecuencia"
              value={frecuenciaDePago}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <FactCard
              label="Plazo"
              value={data.plazo_solicitado ? `${data.plazo_solicitado} meses` : '-'}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <FactCard
              label="Tipo"
              value={getCreditTypeLabel(data.tipo_de_credito_solicitado) ?? '-'}
              icon={<TipoIcon className="h-4 w-4" />}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 sticky bottom-0 bg-background">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-accent text-white hover:bg-brand-accent/90 transition font-medium text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
