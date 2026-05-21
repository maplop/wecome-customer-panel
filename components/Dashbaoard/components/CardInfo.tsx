import type { CardInfoProps } from '../types'

export default function CardInfo({ label, amount, description, buttonLabel, icon, onAction }: CardInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-2xl font-bold text-foreground">
            ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: '#E1941F' }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
