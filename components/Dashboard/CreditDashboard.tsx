'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/common/Header'
import PaymentModal from './components/PaymentModal'
import CreditDetailModal from './components/CreditDetailModal'
import { Calendar, CircleDollarSign, CreditCard, HandCoins, Plus } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { ButtonCard } from '../common'
import { getUserInfoSession } from '@/lib/user-session'
import { logout } from '@/services/auth'

interface Credit {
  id: string
  type: string
  amount: number
  biweeklyPayment: number
  totalPaid: number
  paymentDue: string
  paidPeriods: number
  totalPeriods: number
  status: 'activo' | 'finalizado'
}

// Mock data keyed by email
const MOCK_DATA: Record<string, {
  totalToPay: number
  paymentDueDate: string
  totalCredits: number
  liquidateTotal: number
  extensionCost: number
  credits: Credit[]
}> = {
  'maria.gonzalez@empresa.com': {
    totalToPay: 2268.75,
    paymentDueDate: '15 may. 2025',
    totalCredits: 45000,
    liquidateTotal: 52181.25,
    extensionCost: 489.00,
    credits: [
      {
        id: 'CN-2025-003105',
        type: 'Crédito de nómina',
        amount: 2772.50,
        biweeklyPayment: 2772.50,
        totalPaid: 11090,
        paymentDue: '15 may. 2025',
        paidPeriods: 4,
        totalPeriods: 12,
        status: 'activo',
      },
      {
        id: 'CN-2024-001234',
        type: 'Crédito de nómina',
        amount: 1500.00,
        biweeklyPayment: 1500.00,
        totalPaid: 18000,
        paymentDue: '31 dic. 2024',
        paidPeriods: 12,
        totalPeriods: 12,
        status: 'finalizado',
      },
    ],
  },
  'carlos.ramirez@empresa.com': {
    totalToPay: 2772.50,
    paymentDueDate: '15 may. 2025',
    totalCredits: 30000,
    liquidateTotal: 24942.50,
    extensionCost: 399.00,
    credits: [
      {
        id: 'CN-2025-003105',
        type: 'Crédito de nómina',
        amount: 2772.50,
        biweeklyPayment: 2772.50,
        totalPaid: 11090,
        paymentDue: '15 may. 2025',
        paidPeriods: 4,
        totalPeriods: 12,
        status: 'activo',
      },
      {
        id: 'CN-2024-001234',
        type: 'Crédito de nómina',
        amount: 1500.00,
        biweeklyPayment: 1500.00,
        totalPaid: 18000,
        paymentDue: '31 dic. 2024',
        paidPeriods: 12,
        totalPeriods: 12,
        status: 'finalizado',
      },
    ],
  },
}

type TabFilter = 'todos' | 'actuales' | 'finalizados'

interface UserInfoSession {
  data?: {
    people?: {
      username?: string
      pii?: {
        name?: string
        fullname?: string
        email?: string
        curp?: string
      }
    }
  }
}

export default function CreditDashboard() {
  const router = useRouter()

  const session = getUserInfoSession<UserInfoSession>()

  const user = useMemo(() => {
    const people = session?.data?.people
    const pii = people?.pii
    const email = pii?.email || people?.username || 'usuario@wecome.mx'
    const fullName = pii?.name || pii?.fullname || email.split('@')[0]
    console.log("pii ", pii)
    return {
      name: fullName,
      email,
    }
  }, [session?.data?.people])

  console.log("user ---", user)

  const [activeTab, setActiveTab] = useState<TabFilter>('todos')
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; amount: number }>({ open: false, amount: 0 })
  const [detailModal, setDetailModal] = useState<{ open: boolean; credit: Credit | null }>({ open: false, credit: null })
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const data = MOCK_DATA[user.email.toLowerCase()]

  const filteredCredits = data?.credits.filter((c) => {
    if (activeTab === 'actuales') return c.status === 'activo'
    if (activeTab === 'finalizados') return c.status === 'finalizado'
    return true
  }) ?? []

  const handleOpenPayment = (amount: number) => {
    setPaymentModal({ open: true, amount })
  }

  const handlePaymentSuccess = () => {
    setPaymentModal({ open: false, amount: 0 })
    setPaymentSuccess(true)
    setTimeout(() => setPaymentSuccess(false), 3000)
  }

  const handleOpenDetail = (credit: Credit) => {
    setDetailModal({ open: true, credit })
  }

  const handleDetailPay = () => {
    if (detailModal.credit) {
      setDetailModal({ open: false, credit: null })
      handleOpenPayment(detailModal.credit.biweeklyPayment)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace(ROUTES.AUTH.LOGIN)
  }

  return (
    <>
      {/* Payment Modal */}
      {paymentModal.open && (
        <PaymentModal
          amount={paymentModal.amount}
          onClose={() => setPaymentModal({ open: false, amount: 0 })}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Credit Detail Modal */}
      {detailModal.open && detailModal.credit && (
        <CreditDetailModal
          credit={detailModal.credit}
          onClose={() => setDetailModal({ open: false, credit: null })}
          onPay={handleDetailPay}
        />
      )}

      {/* Success Toast */}
      {paymentSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3 text-white shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-medium">Pago realizado con éxito</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background flex flex-col">
        <Header showLogout onLogout={handleLogout} userEmail={user.email} />

        {/* Main */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
          {/* Welcome + New Request */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              ¡Bienvenido {user.name.split(' ')[0]}!
            </h1>
            <ButtonCard
              variant='secondary'
              onClick={() => router.push(ROUTES.ONBOARDING.CURP_VERIFICATION)}
              className='w-auto px-4 hover:bg-secondary  border-brand-accent text-brand-accent'
            >
              <Plus />
              Nueva solicitud de crédito
            </ButtonCard>
          </div>

          {!data ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M9 12h6" />
                  <path d="M12 9v6" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <p className="text-base font-semibold text-foreground mb-1">Sin créditos activos</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Aún no tienes ningún crédito. Solicita uno ahora y recibe tu dinero en minutos.
              </p>
            </div>
          ) : (
            <>
              {/* 3 summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Card 1: Valor total a pagar */}
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <Calendar className="text-foreground w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Valor total a pagar</span>
                      <span className="text-2xl font-bold text-foreground">${data.totalToPay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fecha límite de pago <strong className="text-foreground">{data.paymentDueDate}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(data.totalToPay)}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] bg-brand-accent"
                  >
                    Pagar
                  </button>
                </div>

                {/* Card 2: Total de tus créditos */}
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <CircleDollarSign className="text-foreground w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Total de tus créditos</span>
                      <span className="text-2xl font-bold text-foreground">${data.totalCredits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Si liquidas hoy pagarías <strong className="text-foreground">${data.liquidateTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(data.liquidateTotal)}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] bg-brand-accent"
                  >
                    Adelantar pago
                  </button>
                </div>

                {/* Card 3: Extensión de pago */}
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <HandCoins className="text-foreground w-5.5 h-5.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Extensión de pago</span>
                      <span className="text-2xl font-bold text-foreground">${data.extensionCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Costo total de la extensión</p>
                  <button
                    type="button"
                    onClick={() => data.credits[0] && handleOpenDetail(data.credits[0])}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] bg-brand-accent"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-6">
                {(['todos', 'actuales', 'finalizados'] as TabFilter[]).map((tab) => {
                  const labels: Record<TabFilter, string> = {
                    todos: 'Todos',
                    actuales: 'Créditos Actuales',
                    finalizados: 'Créditos Finalizados',
                  }
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive
                        ? 'bg-brand-dark text-background'
                        : 'bg-transparent text-foreground border border-border hover:bg-secondary'
                        }`}
                    >
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>

              {/* Credit list */}
              <div className="flex flex-col gap-4">
                {filteredCredits.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No hay créditos en esta categoría.
                  </p>
                ) : (
                  filteredCredits.map((credit) => {
                    const progress = Math.round((credit.paidPeriods / credit.totalPeriods) * 100)
                    const isFinished = credit.status === 'finalizado'

                    return (
                      <div
                        key={credit.id}
                        className="rounded-2xl border border-border bg-card p-5 flex flex-col md:flex-row md:items-center gap-6"
                      >
                        {/* Icon + Info */}
                        <div className="flex items-center gap-4 flex-2 min-w-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary shrink-0">
                            <CreditCard className="text-foreground w-5.5 h-5.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">{credit.type}</span>
                            <span className="text-xs text-muted-foreground font-mono">ID: {credit.id}</span>
                          </div>
                        </div>

                        {/* Amount / Status */}
                        <div className="flex flex-col flex-1 items-start md:items-end md:w-32">
                          {isFinished ? (
                            <span className="text-sm font-semibold text-brand-dark">Finalizado</span>
                          ) : (
                            <span className="text-sm font-bold text-brand-accent">
                              ${credit.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {isFinished ? `Pagado el: ${credit.paymentDue}` : `Pagar antes del: ${credit.paymentDue}`}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col gap-1.5 md:w-44">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Mes {credit.paidPeriods} de {credit.totalPeriods}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: isFinished ? 'var(--brand-dark)' : 'var(--brand-accent)',
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Monto pagado: <strong className="text-foreground">${credit.totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 md:w-40">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(credit)}
                            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
                          >
                            Detalle
                          </button>
                          {!isFinished && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayment(credit.amount)}
                              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] bg-brand-dark"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="py-5 border-t border-border/60 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition underline">Aviso de privacidad</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition underline">Términos y condiciones</a>
          </div>
        </footer>
      </div>
    </>
  )
}
