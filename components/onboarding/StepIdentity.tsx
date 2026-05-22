'use client'

import { useState, useRef } from 'react'
import { WrapperCard, TitleCard, SubtitleCard, ButtonCard } from './common'

interface StepIdentityProps {
  email: string
  onNext: (data: { code: string }) => void
  onBack: () => void
}

export default function StepIdentity({ email, onNext, onBack }: StepIdentityProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const maskedEmail = (() => {
    const [user, domain] = email.split('@')
    if (!user || !domain) return email
    const visible = user.slice(0, 2)
    const masked = '*'.repeat(Math.max(user.length - 2, 3))
    return `${visible}${masked}@${domain}`
  })()

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')
    if (value && index < 5) refs[index + 1].current?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      refs[5].current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Ingresa los 6 dígitos del código'); return }
    onNext({ code })
  }

  return (
    <WrapperCard>
      <div className="flex flex-col gap-2">
        <TitleCard>
          Verificación de identidad
        </TitleCard>
        <SubtitleCard>
          Enviamos un código de verificación de 6 dígitos a:
        </SubtitleCard>
        <p className="text-sm font-semibold text-foreground">{maskedEmail}</p>
      </div>

      <div className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Código de verificación
            </label>
            <div className="flex gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`h-13 w-full rounded-xl border text-center text-lg font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${error ? 'border-destructive' : 'border-border'}`}
                  style={{ minWidth: 0 }}
                  aria-label={`Dígito ${i + 1}`}
                />
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <ButtonCard
            variant="text"
          >
            Reenviar código
          </ButtonCard>

          <ButtonCard
            submit
          >
            Verificar código
          </ButtonCard>
        </form>

        <ButtonCard
          variant="secondary"
          onClick={onBack}
        >
          Regresar
        </ButtonCard>
      </div>
    </WrapperCard >
  )
}
