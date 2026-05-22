// components/card/SubtitleCard.tsx
interface SubtitleCardProps {
  children: React.ReactNode
}

export function SubtitleCard({ children }: SubtitleCardProps) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {children}
    </p>
  )
}
