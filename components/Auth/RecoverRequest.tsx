'use client'

import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from "@/components/common"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"
export default function RecoverRequest() {
  const router = useRouter()

  const recoveryEmail = 'maria.gonzalez@empresa.com';
  const recoveryLoading = false;

  const handleSendRecoveryCode = async () => {
    // Simula el envío del código de recuperación
    alert('Código de recuperación enviado al correo registrado.');
    router.push(ROUTES.AUTH.RECOVER_VERIFY);
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Recupera tu contraseña
        </TitleCard>
        <SubtitleCard>
          Enviaremos un código de 6 digitos al correo registrado para esta demo..
        </SubtitleCard>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Correo registrado para recuperacion
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{recoveryEmail}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Te enviaremos un código temporal de 6 digitos para validar tu identidad y permitir el cambio de contraseña.
        </p>

        <div className="flex flex-col gap-3">
          <ButtonCard
            onClick={handleSendRecoveryCode}
            disabled={recoveryLoading}
            loading={recoveryLoading}
            loadingText="Enviando código..."
          >
            Enviar código
          </ButtonCard>

          <ButtonCard
            variant="secondary"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
          >
            Volver al login
          </ButtonCard>
        </div>
      </div>
    </WrapperCard>
  );
}
