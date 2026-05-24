// components/card/TitleCard.tsx
interface TitleCardProps {
  children: React.ReactNode
}

export function TitleCard({ children }: TitleCardProps) {
  return (
    <h1 className="text-2xl font-bold text-foreground text-balance">
      {children}
    </h1>
  )
}