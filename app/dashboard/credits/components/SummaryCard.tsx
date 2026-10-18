interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  highlighted?: boolean;
}

export default function SummaryCard({
  label,
  value,
  description,
  icon,
  highlighted,
}: SummaryCardProps) {
  return (
    <article
      className={`flex min-h-40 flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm sm:p-6 ${highlighted ? "border-brand-dark bg-brand-dark text-white" : "border-border bg-card"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className={`text-sm ${highlighted ? "text-white/60" : "text-muted-foreground"}`}>{label}</p>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${highlighted ? "bg-white/10 text-brand-accent" : "bg-brand-accent/10 text-brand-accent"}`}>
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <div className={`truncate text-xl font-semibold tracking-tight ${highlighted ? "text-white" : "text-brand-accent"}`}>
          {value}
        </div>
        {description && (
          <div className={`mt-2 text-sm ${highlighted ? "text-white/60" : "text-muted-foreground"}`}>
            {description}
          </div>
        )}
      </div>
    </article>
  );
}
