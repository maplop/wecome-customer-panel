'use client'

interface HeaderProps {
  showLogout?: boolean
  onLogout?: () => void
}

export function Header({
  showLogout = false,
  onLogout
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-4 border-b border-border/60 md:px-6 bg-brand-dark"
    >
      <img
        src="/wecome-log.png"
        alt="CreditoNomina"
        className="h-8 md:h-10 w-auto"
      />

      {showLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-white cursor-pointer transition"
        >
          Cerrar sesión
        </button>
      )}
    </header>
  )
}
