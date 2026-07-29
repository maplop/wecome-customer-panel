'use client'

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from 'react'
import { WrapperCard } from '@/components/common/WrapperCard'
import { TitleCard } from '@/components/common/TitleCard'
import { SubtitleCard } from '@/components/common/SubtitleCard'
import { ButtonCard } from '@/components/common/ButtonCard'
import { useClientProfileStore } from '@/stores/client-profile-store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { useOtpVerificationFlow } from '@/hooks/use-onboarding-otp'
import { ONBOARDING_OTP_LENGTH } from '@/services/onboarding/onboarding.constants'

export default function IdentityVerification() {
  const router = useRouter()
  const { data } = useClientProfileStore()
  const email = data?.correo_electronico

  const [digits, setDigits] = useState(Array.from({ length: ONBOARDING_OTP_LENGTH }, () => ''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const {
    error,
    isVerifying,
    isResending,
    resendAttempts,
    maxResendAttempts,
    secondsLeft,
    canResend,
    resendLimitReached,
    clearError,
    verifyCode,
    resendCode,
  } = useOtpVerificationFlow({
    email,
    onVerified: () => router.push(ROUTES.ONBOARDING.CREATE_ACCOUNT),
    otpLength: ONBOARDING_OTP_LENGTH,
  })

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const next = [...digits]
    next[index] = value
    setDigits(next)
    clearError()

    if (value && index < ONBOARDING_OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, ONBOARDING_OTP_LENGTH)

    if (text.length === ONBOARDING_OTP_LENGTH) {
      setDigits(text.split(''))
      clearError()
      inputRefs.current[ONBOARDING_OTP_LENGTH - 1]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await verifyCode(digits.join(''))
  }

  const handleResend = async () => {
    await resendCode()
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Código de verificación</TitleCard>
        <SubtitleCard>
          Ingresa el código de 6 dígitos que enviamos a: <strong>{email}</strong>
        </SubtitleCard>
      </div>

      <div className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className={`h-13 w-full rounded-xl border text-center text-lg font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border'}`}
                  style={{ minWidth: 0 }}
                  aria-label={`Dígito ${index + 1}`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <ButtonCard
              variant="text"
              onClick={handleResend}
              disabled={!canResend}
              loading={isResending}
              loadingText="Reenviando código..."
            >
              Reenviar código
            </ButtonCard>
            <p className="text-xs text-muted-foreground">
              {resendLimitReached
                ? 'Llegaste al máximo de 3 reenvíos.'
                : secondsLeft > 0
                  ? `Podrás reenviar el código en ${secondsLeft} segundos.`
                  : `Reenvíos usados: ${resendAttempts}/${maxResendAttempts}.`}
            </p>
          </div>

          <ButtonCard submit loading={isVerifying} loadingText="Verificando el código...">
            Verificar código
          </ButtonCard>
        </form>

        <ButtonCard
          variant="secondary"
          onClick={() => router.push(ROUTES.ONBOARDING.USER_CONFIRM)}
          disabled={isVerifying || isResending}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}

