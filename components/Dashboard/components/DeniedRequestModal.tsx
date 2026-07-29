'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CircleDollarSign, Calendar, ShieldCheck } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'
import { formatMoney, formatPaymentFrequency } from '@/utils/formatters'
import { getCreditTypeLabel } from '@/utils/credit-type'
import { InfoCard } from '@/components/common'

interface DeniedRequestModalProps {
  credit: ClientRequestRecord
  onClose: () => void
  onRetry: () => void
}

const SUPPORT_EMAIL = 'soporte@wecome.mx'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DeniedRequestModal({ credit, onClose, onRetry }: DeniedRequestModalProps) {
  const data = credit.data

  const solicitado = Number(data.monto_solicitado ?? 0)
  const frecuenciaDePago = formatPaymentFrequency(data.frecuencia_de_pago_solicitada)

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
              No aprobada
            </span>
            <p className="text-sm text-white/70 leading-relaxed">
              Tu solicitud no cumplió con los requisitos necesarios para su aprobación en este momento.
            </p>
          </div>

          {/* Detalle */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Detalle de la solicitud
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={CircleDollarSign}
                label="Monto solicitado"
                value={formatMoney(solicitado)}
                valueSize="sm"
              />
              <InfoCard
                icon={Calendar}
                label="Plazo"
                value={data.plazo_solicitado ? `${data.plazo_solicitado} meses` : '-'}
                valueSize="sm"
              />
              <InfoCard
                icon={Calendar}
                label="Frecuencia"
                value={frecuenciaDePago}
                valueSize="sm"
              />
              <InfoCard
                icon={ShieldCheck}
                label="Tipo"
                value={getCreditTypeLabel(data.tipo_de_credito_solicitado) ?? '-'}
                valueSize="sm"
                valueClassName="truncate"
              />
              <InfoCard
                icon={Calendar}
                label="Fecha solicitud"
                value={formatDate(credit.created_at)}
                valueSize="sm"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-accent/5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 bg-brand-accent/20 text-brand-accent text-xs font-bold">i</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿Tienes preguntas? Contacta a nuestro equipo en{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-accent hover:underline">
                {SUPPORT_EMAIL}
              </a>
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
            Cerrar
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-dark text-white hover:bg-brand-dark/90 transition font-medium text-sm"
          >
            Intentar de nuevo
          </button>
        </div>

      </div>
    </div>
  )
}
