import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-110 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
