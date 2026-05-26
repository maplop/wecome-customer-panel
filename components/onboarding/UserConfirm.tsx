'use client'

import { useState } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from '../common'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import {
  connectorApiClient,
  CONNECTOR_SERVICES,
  NOTIFICATION_TEMPLATE,
} from '@/api/dynamicore/connector'
import { useClientVerificationStore } from '@/stores/client-store'

const OTP_CLIENT = 142296
const OTP_TYPE = 'client'

interface SendOtpResult {
  channel: string
  success: boolean
  template: number
}

interface SendOtpData {
  code_length: number
  channels: string[]
  sent_to: string
  all_results: SendOtpResult[]
}

interface SendOtpResponse {
  data?: SendOtpData
}

export default function UserConfirm() {
  const router = useRouter()
  const { data } = useClientVerificationStore()

  const curp = data?.curp
  const email = data?.correo_electronico

  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')

  const isVerified = true
  const firstName = curp?.slice(0, 4)

  const sendOtpToEmail = async () => {
    if (!isVerified || isSendingOtp) {
      return
    }

    setOtpError('')
    setIsSendingOtp(true)

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
        setOtpError('No fue posible enviar el código al correo. Intenta nuevamente.')
        return
      }

      router.push(ROUTES.ONBOARDING.IDENTITY_VERIFICATION)
    } catch {
      setOtpError('No fue posible enviar el código al correo. Intenta nuevamente.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Verificación de identidad</TitleCard>
        <SubtitleCard>
          Hemos validado tu CURP. Confirma que la siguiente información corresponde a tu identidad.
        </SubtitleCard>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/50 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold shrink-0 bg-brand-dark">
            {firstName?.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CURP detectado</span>
            <span className="font-semibold text-foreground tracking-wider text-sm">{curp}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Estado</span>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm font-medium text-foreground">Verificado en lista blanca</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                <span className="text-sm font-medium text-red-600">No verificado en lista blanca</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Para continuar, enviaremos un código de verificación al correo registrado:{' '}
        <strong>{email}</strong>
      </p>

      <div className="flex flex-col gap-3">
        {isVerified ? (
          <ButtonCard
            onClick={sendOtpToEmail}
            disabled={isSendingOtp}
            loading={isSendingOtp}
            loadingText="Enviando el código..."
          >
            Enviar código
          </ButtonCard>
        ) : (
          <ButtonCard
            onClick={() => router.push(ROUTES.ONBOARDING.IDENTITY_VERIFICATION)}
            disabled
          >
            No puedes iniciar la solicitud
          </ButtonCard>
        )}
        {otpError && <p className="text-sm text-destructive">{otpError}</p>}
        <ButtonCard
          variant="secondary"
          onClick={() => router.push(ROUTES.ONBOARDING.CURP_VERIFICATION)}
          disabled={isSendingOtp}
        >
          No soy yo, regresar
        </ButtonCard>
      </div>
    </WrapperCard>
  )
}
