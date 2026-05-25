import { cn } from '@/lib/utils'

interface ButtonCardProps {
  variant?: 'primary' | 'secondary' | 'text'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  submit?: boolean
  className?: string  // ✅
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export function ButtonCard({
  variant = 'primary',
  onClick,
  disabled,
  loading,
  loadingText = 'Procesando...',
  children,
  submit = false,
  className,  // ✅
}: ButtonCardProps) {
  const content = loading ? (
    <>
      <Spinner />
      {loadingText}
    </>
  ) : children

  if (variant === 'text') {
    return (
      <button
        type={submit ? 'submit' : 'button'}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'text-sm font-medium transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-brand-accent',
          className
        )}
      >
        {content}
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        type={submit ? 'submit' : 'button'}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2',
          className
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <button
      type={submit ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 bg-brand-accent',
        className
      )}
    >
      {content}
    </button>
  )
}
