'use client'

import { useState } from 'react'

interface StepLoginProps {
  onNext: (data: { curp: string }) => void
  onLoginClick: () => void
}

export default function StepCurpVerification({ onNext, onLoginClick }: StepLoginProps) {
  const [curp, setCurp] = useState('')
  const [error, setError] = useState('')

  const validate = () => {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/
    if (!curp) return 'Ingresa tu CURP'
    if (!curpRegex.test(curp.toUpperCase())) return 'El formato de CURP no es válido'
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    onNext({ curp: curp.toUpperCase() })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Solicita tu crédito de nómina
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ingresa tu CURP para comenzar el proceso de solicitud.
        </p>
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
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#E1941F' }}
        >
          Confirmar CURP
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={onLoginClick}
        className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
      >
        Ingresa a tu cuenta
      </button>
    </div>
  )
}
