export function FactCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-brand-accent/25 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-brand-accent" aria-hidden="true">
          {icon}
        </span>
      </div>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}