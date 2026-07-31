'use client'
import { useEffect, useState } from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { InfoNote } from '@/components/common/InfoNote'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Wallet, CalendarClock, TrendingUp, Receipt, CalendarDays, Shield, Tag } from '@/lib/icons'
import { updateActiveRequestData } from '@/services/client-requests'
import { useClientRequestStore } from '@/stores'
import { formatMoney, formatPaymentFrequency, normalizePaymentFrequency } from '@/utils/formatters'

function toPositiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function FactCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
      </div>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

export default function CreditResult() {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const activeRequest = useClientRequestStore((state) => state.getActiveRequest())
  const data = activeRequest?.data ?? {}

  console.log("Data: ", data)

  // ============================================
  // 1. EXTRAER DATOS DEL RESPONSE
  // ============================================
  const amount = toPositiveNumber(data.monto_solicitado) ?? 0
  const term = toPositiveNumber(data.plazo_solicitado) ?? 12
  const paymentFrequency = normalizePaymentFrequency(data.frecuencia_de_pago_solicitada)
  const paymentFrequencyLabel = formatPaymentFrequency(paymentFrequency)
  const isProtected = data.tipo_de_credito_solicitado === 'protected'

  // ============================================
  // 2. CALCULAR VALORES PARA EL DESGLOSE
  // ============================================
  const pagoSinSeguros = toPositiveNumber(data.pago_por_periodo_sin_seguros) ?? 0
  const pagoConSegurosIva = toPositiveNumber(data.pago_por_periodo_con_seguros_iva) ?? 0 // ✅ AHORA SE USA
  const numeroPeriodos = toPositiveNumber(data.numero_de_periodos) ?? 0
  const montoTotalAPagar = toPositiveNumber(data.monto_total_a_pagar) ?? 0
  const comisionApertura = toPositiveNumber(data.comision_apertura) ?? 0

  // Seguros (vienen del response)
  const seguroVidaAlMillar = toPositiveNumber(data.seguro_vida) ?? 0
  const seguroInvalidezAlMillar = toPositiveNumber(data.seguro_invalidez_total_permanente) ?? 0

  // Calcular seguros por periodo
  const seguroVidaPeriodo = amount * (seguroVidaAlMillar / 1000)
  const seguroInvalidezPeriodo = amount * (seguroInvalidezAlMillar / 1000)
  const segurosPeriodo = seguroVidaPeriodo + seguroInvalidezPeriodo

  // IVA fijo
  const iva = 0.16 // 16% fijo

  // ============================================
  // 3. PREPARAR DATOS SEGÚN TIPO DE CRÉDITO
  // ============================================

  // 🔑 LÓGICA PRINCIPAL: Dependiendo del tipo de crédito
  const getCreditData = () => {
    if (isProtected) {
      // 🔒 PROTEGIDO: Usamos pagoConSegurosIva del backend
      // Calculamos los componentes para el desglose visual
      const subtotal = pagoSinSeguros + segurosPeriodo
      const ivaPeriodo = subtotal * iva

      // ✅ Usamos el valor del backend para el total
      const pagoTotal = pagoConSegurosIva

      const totalSeguros = segurosPeriodo * numeroPeriodos
      const totalIva = ivaPeriodo * numeroPeriodos
      const totalConTodo = pagoTotal * numeroPeriodos

      return {
        tipo: 'Protegido',
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        titulo: 'Crédito Protegido',
        descripcion: 'Tu crédito incluye seguros de vida e invalidez + IVA',

        // Datos del pago periódico
        pagoPeriodico: {
          pagoBase: pagoSinSeguros,
          seguroVida: seguroVidaPeriodo,
          seguroInvalidez: seguroInvalidezPeriodo,
          subtotal: subtotal,
          iva: ivaPeriodo,
          total: pagoTotal, // ✅ Usamos el valor del backend
        },

        // Totales
        totales: {
          capitalIntereses: montoTotalAPagar,
          seguros: totalSeguros,
          iva: totalIva,
          total: totalConTodo,
          comisionApertura: comisionApertura,
          totalConComision: totalConTodo + comisionApertura,
        },

        // Mostrar secciones
        mostrarSeguros: true,
        mostrarIva: true,
        mostrarComision: true,
        mostrarSubtotal: true,
      }
    } else {
      // 🟢 ESENCIAL: Sin seguros y SIN IVA
      // Solo capital + intereses
      const pagoTotal = pagoSinSeguros

      return {
        tipo: 'Esencial',
        icon: <Shield className="h-5 w-5 text-primary" />,
        titulo: 'Crédito Esencial',
        descripcion: 'Tu crédito NO incluye seguros ni IVA',

        // Datos del pago periódico
        pagoPeriodico: {
          pagoBase: pagoSinSeguros,
          seguroVida: 0,
          seguroInvalidez: 0,
          subtotal: pagoSinSeguros,
          iva: 0,
          total: pagoTotal,
        },

        // Totales
        totales: {
          capitalIntereses: montoTotalAPagar,
          seguros: 0,
          iva: 0,
          total: montoTotalAPagar,
          comisionApertura: comisionApertura,
          totalConComision: montoTotalAPagar + comisionApertura,
        },

        // Mostrar secciones
        mostrarSeguros: false,
        mostrarIva: false,
        mostrarComision: true,
        mostrarSubtotal: false,
      }
    }
  }

  const creditData = getCreditData()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!hydrated) {
    return <CreditResultSkeleton />
  }

  const handleContinue = async () => {
    const nextStep = ROUTES.ONBOARDING.CREDIT_AUTHORIZATION
    setIsSubmitting(true)
    setError('')
    try {
      await updateActiveRequestData({ paso_actual: nextStep })
      router.push(nextStep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatMoney(creditData.totales.comisionApertura)}
            </span>
          </div>
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
            icon={creditData.icon}
          />
        </section>

        {/* Pago periódico */}
        <section className=" rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
            <SectionTitle>
              ¿Qué pagas cada {paymentFrequencyLabel.toLowerCase()}?
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
              label={`Total por ${paymentFrequencyLabel.toLowerCase()}`}
              value={creditData.pagoPeriodico.total}
              hint={`Lo que pagas cada ${paymentFrequencyLabel.toLowerCase()}`}
            />
          </div>
        </section>

        {/* Total a pagar */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
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
          onClick={() => router.push(ROUTES.ONBOARDING.CREDIT_SELECTION)}
        >
          Regresar
        </ButtonCard>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </WrapperCard>
  )
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function Row({
  label,
  value,
  icon,
  operator,
  tone = "default",
}: {
  label: string
  value: number
  icon?: React.ReactNode
  operator?: "+" | "="
  tone?: "default" | "muted"
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {operator ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground"
            aria-hidden="true"
          >
            {operator}
          </span>
        ) : icon ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span
          className={`truncate text-sm ${tone === "muted" ? "text-muted-foreground" : "text-foreground"}`}
        >
          {label}
        </span>
      </div>
      <span className="shrink-0 text-sm tabular-nums text-foreground">{formatMoney(value)}</span>
    </div>
  )
}

function TotalRow({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-dark px-4 py-3.5 text-primary-foreground">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {hint ? <span className="text-xs text-primary-foreground/70">{hint}</span> : null}
      </div>
      <span className="text-lg font-bold tabular-nums">{formatMoney(value)}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  )
}

function CreditResultSkeleton() {
  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-muted">
        <Skeleton className="w-10 h-10 rounded-full bg-muted-foreground/20" />
        <Skeleton className="h-3 w-28 bg-muted-foreground/20" />
        <Skeleton className="h-10 w-40 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-8 bg-muted-foreground/20" />
      </div>
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex flex-col gap-4">
        <Skeleton className="h-3 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-full bg-muted-foreground/20" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </WrapperCard>
  )
}
