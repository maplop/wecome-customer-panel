import Header from '@/components/common/Header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="py-4 px-5 text-center border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Wecome
        </p>
      </footer>
    </div>
  )
}
