'use client'

import { useState } from 'react'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from './common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'

const MONTHLY_RATE = 0.028
const COMMISSION_RATE = 0.02

export default function FinalConfirm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const amount = 15000
  const term = 12
  const hasInsurance = true

  const totalInterest = Math.round(amount * MONTHLY_RATE * term)
  const insuranceCost = hasInsurance ? Math.round(amount * 0.02) : 0
  const totalPayment = amount + totalInterest + insuranceCost
  const biweeklyPayment = totalPayment / (term * 2)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  const formattedStart = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    router.push(ROUTES.ONBOARDING.TERMS_ACCEPTANCE)
  }

  const details = [
    { label: 'Monto aprobado', value: `$${amount.toLocaleString('es-MX')} MXN` },
    { label: 'Pago quincenal', value: `$${biweeklyPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}` },
    { label: 'Plazo', value: `${term} meses (${term * 2} quincenas)` },
    ...(hasInsurance ? [{ label: 'Seguro', value: 'Incluido' }] : []),
    { label: 'Fecha de inicio', value: formattedStart },
  ]

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Confirmación final
        </TitleCard>
        <SubtitleCard>
          Revisa los datos finales y confirma tu solicitud de crédito.
        </SubtitleCard>
      </div>

      {/* Final card */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="px-5 py-4 flex flex-col items-center gap-2 text-center bg-brand-dark">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <span className="text-white font-semibold text-base">Solicitud lista para confirmar</span>
        </div>
        <div className="divide-y divide-border">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <span className="text-sm font-semibold text-foreground text-right max-w-[55%]">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleConfirm}
          disabled={loading}
          loading={loading}
        >
          Confirmar solicitud
        </ButtonCard>
        <ButtonCard
          variant='secondary'
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SUMMARY)}
          disabled={loading}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}
