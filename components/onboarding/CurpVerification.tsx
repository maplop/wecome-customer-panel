'use client'

import { useState } from 'react'
import { useClientVerificationStore } from '@/stores/client-store'
import { ButtonCard, SubtitleCard, TitleCard, WrapperCard } from './common'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function CurpVerification() {
  const router = useRouter()

  const [curp, setCurp] = useState('')
  const [error, setError] = useState('')
  const { loading, error: storeError, verifyCurp } = useClientVerificationStore()

  const validate = () => {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/
    if (!curp) return 'Ingresa tu CURP'
    if (!curpRegex.test(curp.toUpperCase())) return 'El formato de CURP no es válido'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    const source = await verifyCurp(curp.toUpperCase())
    if (source) {
      router.push(ROUTES.ONBOARDING.IDENTITY_VERIFICATION)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Solicita tu crédito de nómina
        </TitleCard>
        <SubtitleCard>
          Ingresa tu CURP para comenzar el proceso de solicitud.
        </SubtitleCard>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="curp" className="text-sm font-medium text-foreground">
            CURP
          </label>
          <input
            id="curp"
            type="text"
            maxLength={18}
            placeholder="AAAA000000AAAAAA00"
            value={curp}
            onChange={(e) => {
              setCurp(e.target.value.toUpperCase())
              if (error) setError('')
            }}
            className={`w-full rounded-xl border px-4 py-3 text-sm uppercase tracking-widest text-foreground placeholder:text-muted-foreground/60 placeholder:normal-case placeholder:tracking-normal outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border bg-background'}`}
          />
          {(error || storeError) && (
            <p className="text-xs text-destructive">{error || storeError}</p>
          )}
        </div>

        <ButtonCard
          variant="primary"
          submit
          disabled={loading}
          loading={loading}
          loadingText="Verificando..."
        >
          Confirmar CURP
        </ButtonCard>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <ButtonCard
        variant="secondary"
        onClick={() => router.push(ROUTES.AUTH.LOGIN)}
      >
        Ingresa a tu cuenta
      </ButtonCard>
    </WrapperCard>
  )
}
