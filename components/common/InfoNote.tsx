import { ReactNode } from 'react'
import { Info } from 'lucide-react'

interface InfoNoteProps {
  text: string
  icon?: ReactNode
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function InfoNote({
  text,
  icon,
  className = "",
  iconClassName = "",
  textClassName = ""
}: InfoNoteProps) {
  return (
    <div className={`rounded-2xl border border-border bg-secondary/40 p-4 flex gap-3 items-center ${className}`}>
      {icon ? (
        <div className={`shrink-0 ${iconClassName}`}>
          {icon}
        </div>
      ) : (
        <Info className="text-brand-accent shrink-0" />
      )}
      <p className={`text-xs text-muted-foreground leading-relaxed ${textClassName}`}>
        {text}
      </p>
    </div>
  )
}