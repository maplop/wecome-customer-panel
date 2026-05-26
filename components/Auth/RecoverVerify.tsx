'use client'

import { useState, useRef } from "react"
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from "@/components/common"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"

const RECOVERY_EMAIL = "maria.gonzalez@empresa.com"
const RECOVERY_CODE = "123456"

function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  if (!user || !domain) return email
  const visible = user.slice(0, 2)
  const masked = "*".repeat(Math.max(user.length - 2, 3))
  return `${visible}${masked}@${domain}`
}

export default function RecoverVerify() {
  const router = useRouter()

  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  // ✅ Un solo useRef con array en lugar de Array.from con useRef adentro
  const refs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null])

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError("")
    // ✅ Salta al siguiente input al escribir
    if (value && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // ✅ Regresa al anterior al borrar
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length !== 6) return
    setDigits(pasted.split(""))
    setError("")
    refs.current[5]?.focus()
  }

  const handleResend = async () => {
    setDigits(["", "", "", "", "", ""])
    setError("")
    setInfo("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setInfo(`Reenviamos el código a ${maskEmail(RECOVERY_EMAIL)}`)
    refs.current[0]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join("")
    if (code.length !== 6) { setError("Ingresa los 6 dígitos."); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    if (code !== RECOVERY_CODE) { setError("Código inválido. Usa 123456 para esta demo."); return }
    router.push(ROUTES.AUTH.RECOVER_RESET)
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>Verifica el código</TitleCard>
        <SubtitleCard>
          Captura el código que enviamos al correo registrado para continuar.
        </SubtitleCard>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-border bg-secondary/60 px-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">Correo verificado</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{maskEmail(RECOVERY_EMAIL)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Código demo: <span className="font-mono text-foreground">{RECOVERY_CODE}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Código de verificacion
            </label>
            <div className="flex gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { refs.current[index] = el }} // ✅ ref callback
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className={`h-13 w-full rounded-xl border text-center text-lg font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border'}`}
                  style={{ minWidth: 0 }}
                  aria-label={`Digito ${index + 1}`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {info && <p className="text-xs text-emerald-700">{info}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <ButtonCard variant="text" onClick={handleResend} disabled={loading} loading={loading} loadingText="Reenviando...">
              Reenviar código
            </ButtonCard>
            <ButtonCard submit disabled={loading} loading={loading} loadingText="Validando...">
              Validar código
            </ButtonCard>
            <ButtonCard variant="secondary" onClick={() => router.push(ROUTES.AUTH.LOGIN)}>
              Regresar
            </ButtonCard>
          </div>
        </div>
      </form>
    </WrapperCard>
  )
}
