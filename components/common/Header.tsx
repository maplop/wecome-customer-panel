'use client'

import { useState, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User, LogOut, SquareAsterisk } from '@/lib/icons'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    {
      id: 'profile',
      label: 'Mi perfil',
      icon: User,
      onClick: () => router.push(ROUTES.PROFILE.ROOT),
    },
    {
      id: 'change-password',
      label: 'Cambiar contraseña',
      icon: SquareAsterisk,
      onClick: () => router.push(ROUTES.PROFILE.PASSWORD_CHANGE),
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: LogOut,
      onClick: onLogout,
    },
  ]

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/60 md:px-6 bg-brand-dark">
      <img
        src="/wecome-log.png"
        alt="CreditoNomina"
        className="h-8 md:h-10 w-auto"
      />

      {mounted && showLogout && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-white cursor-pointer transition hover:opacity-90"
            >
              <span className="max-w-55 truncate">{userEmail || 'Mi cuenta'}</span>
              <span aria-hidden>▾</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            align="end"
            className="w-56 rounded-xl border border-border bg-background shadow-lg z-20 p-1"
          >
            {menuItems.map((item) => (
              <DropdownMenu.Item
                key={item.id}
                onClick={item.onClick}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md cursor-pointer outline-none"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
    </header>
  )
}
