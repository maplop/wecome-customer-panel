import { formatMoney } from "@/utils/formatters"

export function TotalRow({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-dark px-4 py-3.5 text-primary-foreground">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {hint ? <span className="text-xs text-primary-foreground/70">{hint}</span> : null}
      </div>
      <span className="text-lg font-bold tabular-nums">{formatMoney(value)}</span>
    </div>
  )
}