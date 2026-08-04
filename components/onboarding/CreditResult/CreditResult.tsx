'use client'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { InfoNote } from '@/components/common/InfoNote'
import { ShieldCheck, Wallet, CalendarClock, TrendingUp, CalendarDays, Shield, Tag } from '@/lib/icons'
import { formatMoney } from '@/utils/formatters'
import { TotalRow, FactCard, Row, SectionTitle } from '../../common/CreditDetails'
import { useCreditResult } from './useCreditResult'


const ICONS = { 'shield-check': ShieldCheck, shield: Shield } as const


export default function CreditResult() {

  const { amount, term, paymentFrequencyLabel, creditData, isSubmitting, error, handleContinue, goBack } = useCreditResult()

  const TipoIcon = ICONS[creditData.iconKey]

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Resultado de tu crédito</TitleCard>
        <SubtitleCard>
          Aquí está el resumen del crédito que seleccionaste.
        </SubtitleCard>
      </div>

      <div className="flex flex-col gap-5">
        {/* Monto solicitado - héroe */}
        <section
          className=" rounded-2xl bg-brand-dark p-5 text-primary-foreground shadow-sm"
          aria-label="Monto solicitado"
        >
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Wallet className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Monto solicitado</span>
          </div>
          <p className="text-4xl font-bold text-white mt-2 tabular-nums">
            {formatMoney(amount)}
          </p>
        </section>

        {/* Datos rápidos del crédito */}
        <section className=" grid grid-cols-3 gap-3" aria-label="Resumen del crédito">
          <FactCard
            label="Frecuencia"
            value={paymentFrequencyLabel}
            icon={<CalendarClock className="h-4 w-4" />}
          />
          <FactCard
            label="Plazo"
            value={`${term} meses`}
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <FactCard
            label="Tipo"
            value={creditData.tipo}
            icon={<TipoIcon className="h-4 w-4" />}
          />
        </section>

        {/* Pago periódico */}
        <section className=" rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1">
            <SectionTitle>
              ¿Qué pagas {paymentFrequencyLabel.toLowerCase()}?
            </SectionTitle>
          </div>

          <div className="divide-y divide-border">
            <Row
              label="Pago base (capital + intereses)"
              value={creditData.pagoPeriodico.pagoBase}
              icon={<TrendingUp className="h-4 w-4" />}
            />

            {/* Solo mostrar seguros si es PROTEGIDO */}
            {creditData.mostrarSeguros && (
              <>
                <Row
                  label="Seguro de vida"
                  value={creditData.pagoPeriodico.seguroVida}
                  operator="+"
                />
                <Row
                  label="Seguro de invalidez"
                  value={creditData.pagoPeriodico.seguroInvalidez}
                  operator="+"
                />
              </>
            )}

            {/* Mostrar subtotal solo si hay seguros */}
            {creditData.mostrarSubtotal && (
              <Row
                label="Subtotal"
                value={creditData.pagoPeriodico.subtotal}
                operator="="
                tone="muted"
              />
            )}

            {/* Solo mostrar IVA si es PROTEGIDO */}
            {creditData.mostrarIva && (
              <Row
                label="IVA (16%)"
                value={creditData.pagoPeriodico.iva}
                operator="+"
              />
            )}
          </div>

          <div className="mt-4">
            <TotalRow
              label={`Total ${paymentFrequencyLabel.toLowerCase()}`}
              value={creditData.pagoPeriodico.total}
              hint={`Lo que pagas ${paymentFrequencyLabel.toLowerCase()}`}
            />
          </div>
        </section>

        {/* Total a pagar */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1">
            <SectionTitle>¿Cuánto pagarás en total?</SectionTitle>
          </div>

          <div className="divide-y divide-border">
            <Row
              label="Total capital + intereses"
              value={creditData.totales.capitalIntereses}
              icon={<TrendingUp className="h-4 w-4" />}
            />

            {/* Solo mostrar seguros si es PROTEGIDO */}
            {creditData.mostrarSeguros && (
              <Row
                label="Total seguros"
                value={creditData.totales.seguros}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
            )}

            {/* Solo mostrar IVA si es PROTEGIDO */}
            {creditData.mostrarIva && (
              <Row
                label="Total IVA"
                value={creditData.totales.iva}
                operator="+"
              />
            )}
          </div>

          <div className="mt-4">
            <TotalRow
              label={"Total a pagar"}
              value={creditData.totales.total}
              hint={creditData.mostrarSeguros
                ? 'Suma de capital + intereses + seguros + IVA'
                : 'Suma de capital + intereses (sin seguros ni IVA)'
              }
            />
          </div>
        </section>

        {/* Comisión por apertura - informativa */}
        <section
          className=" rounded-2xl border border-dashed border-border bg-muted/40 p-4"
          aria-label="Comisión por apertura"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary" aria-hidden="true">
                <Tag className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Comisión por apertura</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Se descuenta una sola vez al inicio. No se suma a tu pago semanal ni al total.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
              {formatMoney(creditData.totales.comisionApertura)}
            </span>
          </div>
        </section>

        <InfoNote text="Las condiciones mostradas podrán modificarse como resultado de la evaluación y validación de la solicitud de crédito." />
      </div>

      <div className="flex flex-col gap-3">
        <ButtonCard
          onClick={handleContinue}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Continuar
        </ButtonCard>
        <ButtonCard
          variant="secondary"
          disabled={isSubmitting}
          onClick={goBack}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}

