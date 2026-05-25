// components/card/WrapperCard.tsx
interface WrapperCardProps {
  children: React.ReactNode
  className?: string
}

export function WrapperCard({ children, className = '' }: WrapperCardProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {children}
    </div>
  )
}