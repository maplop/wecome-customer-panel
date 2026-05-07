'use client'

interface StepIndicatorProps {
  current: number
  total: number
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  const pct = ((current - 1) / (total - 1)) * 100

  return (
    <div className="flex flex-col gap-2" aria-label={`Paso ${current} de ${total}`}>
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: '#E1941F' }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: '#E1941F' }}>
          Paso {current} de {total}
        </span>
        <span className="text-xs text-muted-foreground">
          {Math.round(pct)}% completado
        </span>
      </div>
    </div>
  )
}
