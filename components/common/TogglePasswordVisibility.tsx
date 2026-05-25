import { Eye, EyeOff } from '@/lib/icons'

export function TogglePasswordVisibility({
  visible,
  onToggle,
  label,
}: {
  visible: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
      aria-label={label}
    >
      {visible ? (
        <EyeOff />
      ) : (
        <Eye />
      )}
    </button>
  )
}
