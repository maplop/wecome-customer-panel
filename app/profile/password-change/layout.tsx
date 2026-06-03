interface PasswordChangeLayoutProps {
  children: React.ReactNode
}

export default function PasswordChangeLayout({
  children,
}: PasswordChangeLayoutProps) {
  return <div className="rounded-2xl border border-border bg-card p-6 shadow-sm w-full max-w-110 mx-auto">{children}</div>
}
