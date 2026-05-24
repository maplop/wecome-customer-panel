'use client'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from './common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'


export default function CreditSuccess() {
  const router = useRouter()

  const onRestart = () => {
    router.push(ROUTES.DASHBOARD.ROOT)
  }

  const amount = 15000
  return (
    <WrapperCard className="gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-dark"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="stroke-brand-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <TitleCard>
            ¡Solicitud enviada!
          </TitleCard>
          <SubtitleCard>
            Tu solicitud de crédito por{' '}
            <strong className="text-foreground">${amount.toLocaleString('es-MX')} MXN</strong>{' '}
            ha sido enviada a nuestro equipo y se encuentra en proceso de revisión
          </SubtitleCard>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-4 text-left">
        <p className="text-sm font-semibold text-foreground">¿Qué sigue?</p>
        <div className="flex flex-col gap-3">
          {[
            { step: '01', text: 'Recibirás un correo de confirmación en los próximos minutos.' },
            { step: '02', text: 'Un asesor revisará tu solicitud en un plazo de 24 horas.' },
            { step: '03', text: 'El depósito se realizará en máximo 2 días hábiles.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-brand-accent"
              >
                {step}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <ButtonCard
        variant='secondary'
        onClick={onRestart}
      >
        Ver solicitud
      </ButtonCard>
    </WrapperCard>
  )
}
