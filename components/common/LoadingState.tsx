interface LoadingStateProps {
  label?: string
  className?: string
  spinnerClassName?: string
  textClassName?: string
}

export function LoadingState({
  label = 'Cargando información...',
  className = '',
  spinnerClassName = '',
  textClassName = '',
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 gap-3 ${className}`}>
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent ${spinnerClassName}`} />
      <p className={`text-sm text-muted-foreground ${textClassName}`}>{label}</p>
    </div>
  )
}