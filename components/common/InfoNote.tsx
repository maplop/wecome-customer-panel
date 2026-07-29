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
    <div className={`rounded-2xl border-brand-accent bg-brand-accent/5 border  p-4 flex gap-3 items-center ${className}`}>
      {icon ? (
        <div className={`shrink-0 ${iconClassName}`}>
          {icon}
        </div>
      ) : (
        <Info className="text-brand-accent shrink-0" />
      )}
      <p className={`text-xs leading-relaxed text-brand-accent ${textClassName}`}>
        {text}
      </p>
    </div>
  )
}