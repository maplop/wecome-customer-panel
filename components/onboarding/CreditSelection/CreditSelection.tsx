'use client'

import { ButtonCard } from '@/components/common/ButtonCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { TitleCard } from '@/components/common/TitleCard'
import { WrapperCard } from '@/components/common/WrapperCard'
import { ROUTES } from '@/lib/routes'
import RiskModal from './RiskModal'
import { formatMoney } from '@/utils/formatters'
import { Shield, ShieldCheck, Loader2 } from '@/lib/icons'
import { useCreditSelection, TERMS, PAYMENT_FREQUENCIES } from './useCreditSelection'


export default function CreditSelection() {
  const {
    salaryBrutoNum,
    minAmount,
    maxAmount,
    pct,
    term,
    paymentFrequency,
    amount,
    amountInput,
    hasInsurance,
    showRiskModal,
    isSubmitting,
    isEvaluating,
    isMaxAmountEstimated,
    hasMaxAmountError,
    error,
    setTerm,
    setPaymentFrequency,
    handleAmountChange,
    handleAmountInputChange,
    handleAmountInputBlur,
    handleAmountInputKeyDown,
    handleInsuranceClick,
    handleRiskAccept,
    handleRiskCancel,
    handleContinue,
    retryMaxAmountEstimate,
    router,

  } = useCreditSelection()


  return (
    <>
      <WrapperCard>
        <div className="flex flex-col gap-2">
          <TitleCard>
            Elige tu crédito
          </TitleCard>
          <SubtitleCard>
            Ajusta el monto y el plazo de acuerdo a tus necesidades.
          </SubtitleCard>
        </div>

        {/* Info salario */}
        {salaryBrutoNum > 0 && (
          <div className="flex justify-between items-center gap-1 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <span className="text-xs text-muted-foreground leading-tight">Salario bruto mensual registrado</span>
            <span className="text-sm font-semibold text-foreground">
              {formatMoney(salaryBrutoNum)} MXN
            </span>
          </div>
        )}

        {/* Amount slider */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground">
                Monto del crédito
              </label>

              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountInput}
                  onChange={handleAmountInputChange}
                  onBlur={handleAmountInputBlur}
                  onKeyDown={handleAmountInputKeyDown}
                  className="w-full py-2 text-right text-sm font-semibold text-foreground outline-none focus:border-brand-accent"
                />
                <label className="text-sm font-medium  text-muted-foreground">
                  MXN
                </label>
              </div>
            </div>

            <div className="relative py-2">
              <input
                type="range"
                min={minAmount}
                max={maxAmount}
                step={1}
                value={amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--brand-accent) 0%, var(--brand-accent) ${pct}%, var(--brand-inactive) ${pct}%, var(--brand-inactive) 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${formatMoney(minAmount)}</span>
              {isEvaluating ? (
                <span className="flex items-center gap-1 italic text-muted-foreground/80">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Calculando...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  ${formatMoney(maxAmount)}
                  {isMaxAmountEstimated && (
                    <span className="italic text-muted-foreground/70">
                      (estimado)
                      {hasMaxAmountError && (
                        <button
                          type="button"
                          onClick={retryMaxAmountEstimate}
                          className="ml-1 underline hover:text-brand-accent"
                        >
                          Reintentar
                        </button>
                      )}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Plazo + Frecuencia de pago, lado a lado */}
          <div className="grid grid-cols-[2fr_3fr] gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Plazo</label>
              <div className="flex rounded-xl bg-secondary p-1">
                {TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerm(t)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${term === t
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {t} meses
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Frecuencia de pago</label>
              <div className="flex rounded-xl bg-secondary p-1">
                {PAYMENT_FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setPaymentFrequency(freq)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${paymentFrequency === freq
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {freq === 'SEMANAL' ? 'Semanal' : freq === 'QUINCENAL' ? 'Quincenal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insurance toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Tipo de crédito
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInsuranceClick(true)}
                className={`relative rounded-xl p-4 text-left transition active:scale-[0.98] ${hasInsurance === 'protected'
                  ? 'border-2 border-brand-accent bg-brand-accent/10'
                  : 'border border-brand-accent/25 bg-white'
                  }`}
              >
                <ShieldCheck
                  className={`absolute top-3 right-3 h-5 w-5 ${hasInsurance === 'protected'
                    ? 'text-brand-accent'
                    : 'text-muted-foreground/50'
                    }`}
                />

                <span
                  className={`block text-sm font-semibold ${hasInsurance === 'protected'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  Protegido
                </span>

                <span
                  className={`block text-xs mt-0.5 ${hasInsurance === 'protected'
                    ? 'text-brand-accent font-medium'
                    : 'text-muted-foreground'
                    }`}
                >
                  Con seguro incluido
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleInsuranceClick(false)}
                className={`relative rounded-xl p-4 text-left transition active:scale-[0.98] ${hasInsurance === 'esencial'
                  ? 'border-2 border-brand-accent bg-brand-accent/10'
                  : 'border border-brand-accent/25 bg-white'
                  }`}
              >
                <Shield
                  className={`absolute top-3 right-3 h-5 w-5 ${hasInsurance === 'esencial'
                    ? 'text-brand-accent'
                    : 'text-muted-foreground/50'
                    }`}
                />

                <span
                  className={`block text-sm font-semibold ${hasInsurance === 'esencial'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                    }`}
                >
                  Esencial
                </span>

                <span
                  className={`block text-xs mt-0.5 ${hasInsurance === 'esencial'
                    ? 'text-brand-accent font-medium'
                    : 'text-muted-foreground'
                    }`}
                >
                  Sin seguro
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            <ButtonCard
              onClick={handleContinue}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Continuar con mi crédito
            </ButtonCard>
            <ButtonCard
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => router.push(ROUTES.ONBOARDING.UPLOAD_DOCUMENTS)}
            >
              Regresar
            </ButtonCard>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      </WrapperCard>

      {showRiskModal && (
        <RiskModal
          onAccept={handleRiskAccept}
          onCancel={handleRiskCancel}
        />
      )}
    </>
  )
}
