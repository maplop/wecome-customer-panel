'use client'

import { useEffect, useRef, useState } from 'react'

interface HeaderProps {
  showLogout?: boolean
  onLogout?: () => void
  userEmail?: string
}

export function Header({
  showLogout = false,
  onLogout,
  userEmail = '',
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      const target = event.target as Node
      if (!containerRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/60 md:px-6 bg-brand-dark">
      <img
        src="/wecome-log.png"
        alt="CreditoNomina"
        className="h-8 md:h-10 w-auto"
      />

      {showLogout && (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 text-sm text-white cursor-pointer transition hover:opacity-90"
          >
            <span className="max-w-[220px] truncate">{userEmail || 'Mi cuenta'}</span>
            <span aria-hidden>{menuOpen ? '▴' : '▾'}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-background shadow-lg z-20">
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary rounded-xl"
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
