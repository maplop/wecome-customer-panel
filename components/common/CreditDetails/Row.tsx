import { formatMoney } from "@/utils/formatters"

export function Row({
  label,
  value,
  icon,
  operator,
  tone = "default",
}: {
  label: string
  value: number
  icon?: React.ReactNode
  operator?: "+" | "="
  tone?: "default" | "muted"
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {operator ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground"
            aria-hidden="true"
          >
            {operator}
          </span>
        ) : icon ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span
          className={`truncate text-sm ${tone === "muted" ? "text-muted-foreground" : "text-foreground"}`}
        >
          {label}
        </span>
      </div>
      <span className="shrink-0 text-sm tabular-nums text-foreground">{formatMoney(value)}</span>
    </div>
  )
}