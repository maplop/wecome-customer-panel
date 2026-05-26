'use client'

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { useClientVerificationStore } from '@/stores/client-store'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import {
  CONNECTOR_SERVICES,
  NOTIFICATION_TEMPLATE,
  connectorApiClient,
} from '@/api/dynamicore/connector'

const OTP_LENGTH = 6
const OTP_CLIENT = 142296
const OTP_TYPE = 'client'
const RESEND_WAIT_SECONDS = 60
const MAX_RESEND_ATTEMPTS = 3

interface ValidateOtpResponse {
  data?: {
    client?: number
    valid?: boolean
  }
}

interface SendOtpResult {
  channel: string
  success: boolean
}

interface SendOtpResponse {
  data?: {
    all_results?: SendOtpResult[]
  }
}

export default function IdentityVerification() {
  const router = useRouter()
  const { data } = useClientVerificationStore()
  const email = data?.correo_electronico

  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''))
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_WAIT_SECONDS)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)

    if (text.length === OTP_LENGTH) {
      setDigits(text.split(''))
      setError('')
      inputRefs.current[OTP_LENGTH - 1]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (isVerifying) {
      return
    }

    const otp = digits.join('')
    if (otp.length < OTP_LENGTH) {
      setError('Ingresa los 6 dígitos del código.')
      return
    }

    setError('')
    setIsVerifying(true)

    try {
      const response = await connectorApiClient.post<ValidateOtpResponse>(
        CONNECTOR_SERVICES.VALIDATE_OTP,
        {
          client: OTP_CLIENT,
          type: OTP_TYPE,
          otp,
        },
      )

      if (response.data?.data?.valid !== true) {
        setError('El código no es válido. Verifica e intenta nuevamente.')
        return
      }

      router.push(ROUTES.ONBOARDING.CREATE_ACCOUNT)
    } catch {
      setError('No fue posible validar el código. Intenta nuevamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  const canResend =
    secondsLeft === 0 &&
    resendAttempts < MAX_RESEND_ATTEMPTS &&
    !isResending &&
    !isVerifying

  const handleResend = async () => {
    if (!canResend) {
      return
    }

    setError('')
    setIsResending(true)

    try {
      const response = await connectorApiClient.post<SendOtpResponse>(
        CONNECTOR_SERVICES.SEND_OTP,
        {
          email,
          client: OTP_CLIENT,
          template: NOTIFICATION_TEMPLATE,
          type: OTP_TYPE,
        },
      )

      const emailResult = response.data?.data?.all_results?.find(
        (item) => item.channel === 'EMAIL',
      )

      if (!emailResult?.success) {
        setError('No fue posible reenviar el código. Intenta nuevamente.')
        return
      }

      setResendAttempts((prev) => prev + 1)
      setSecondsLeft(RESEND_WAIT_SECONDS)
    } catch {
      setError('No fue posible reenviar el código. Intenta nuevamente.')
    } finally {
      setIsResending(false)
    }
  }

  const resendLimitReached = resendAttempts >= MAX_RESEND_ATTEMPTS

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
                  : `Reenvíos usados: ${resendAttempts}/${MAX_RESEND_ATTEMPTS}.`}
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
