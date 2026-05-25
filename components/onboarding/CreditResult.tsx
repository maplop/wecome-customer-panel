'use client'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'

export default function CreditResult() {
  const router = useRouter()

  const salary = 3500
  const maxCredit = salary * 3
  const monthlyRate = 0.028
  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Resultado de tu crédito
        </TitleCard>
        <SubtitleCard>
          Basándonos en tu salario, este es el monto máximo preaprobado para ti.
        </SubtitleCard>
      </div>

      {/* Hero amount */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-dark"
      >
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Monto máximo aprobado</span>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-bold text-white">
            ${maxCredit.toLocaleString('es-MX')}
          </span>
          <span className="text-sm text-white/60">MXN</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-brand-success-light" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-xs text-white/70">Preaprobado al instante</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tasa mensual', value: '4.0%' },
          { label: 'Apertura', value: '3.0%' },
          //{ label: 'Plazo máx.', value: '24 meses' },
          { label: 'Sin aval', value: '100%' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <span className="text-xs text-muted-foreground leading-tight">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SELECTION)}
        >
          Continuar
        </ButtonCard>
        <ButtonCard
          variant="secondary"
          onClick={() => router.push(ROUTES.ONBOARDING.FINANCIAL_DATA)}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}
