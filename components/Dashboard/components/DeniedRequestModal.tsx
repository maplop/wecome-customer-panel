'use client'

import { useEffect } from 'react'
import { X, AlertCircle } from '@/lib/icons'
import type { ClientRequestRecord } from '@/types/client-request'
import { getCreditTypeLabel } from '@/utils/credit-type'

interface DeniedRequestModalProps {
  credit: ClientRequestRecord
  onClose: () => void
  onRetry: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DeniedRequestModal({ credit, onClose, onRetry }: DeniedRequestModalProps) {
  // Datos mockeados para la denegación
  const mockReason = {
    razonPrincipal: 'Ingresos insuficientes',
    detalles: 'El ingreso registrado en tu perfil no cumple con los requisitos mínimos para este monto solicitado.',
    sugerencia: 'Puedes solicitar un monto menor o actualizar tu información de ingresos.',
    contacto: 'soporte@wecome.mx',
    fechaDenegacion: new Date().toISOString(),
  }

  const data = credit.data

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
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
        <div className="px-6 py-6 flex flex-col gap-6">

          {/* Mensaje principal */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-semibold text-destructive">
              {mockReason.razonPrincipal}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {mockReason.detalles}
            </p>
          </div>

          {/* Información de la solicitud */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Resumen de tu solicitud</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
                <span className="text-xs text-muted-foreground">Monto solicitado</span>
                <span className="text-sm font-semibold text-foreground">${data.monto_solicitado ?? '—'}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50">
                <span className="text-xs text-muted-foreground">Plazo</span>
                <span className="text-sm font-semibold text-foreground">{data.plazo ? `${data.plazo} meses` : '—'}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50 col-span-2">
                <span className="text-xs text-muted-foreground">Tipo de crédito</span>
                <span className="text-sm font-semibold text-foreground">{getCreditTypeLabel(data.tipo_de_credito)}</span>
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/50 col-span-2">
                <span className="text-xs text-muted-foreground">Fecha de denegación</span>
                <span className="text-sm font-semibold text-foreground">{formatDate(mockReason.fechaDenegacion)}</span>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground">¿Tienes preguntas?</p>
            <p className="text-sm font-medium text-foreground">
              Contacta a nuestro equipo en{' '}
              <a href={`mailto:${mockReason.contacto}`} className="text-brand-accent hover:underline">
                {mockReason.contacto}
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

