import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  valueSize?: "sm" | "lg";
  className?: string;
  valueClassName?: string;
  iconClassName?: string;
}

export function InfoCard({
  icon: Icon,
  label,
  value,
  valueSize = "lg",
  className = "",
  valueClassName = "",
  iconClassName = "",
}: InfoCardProps) {
  const valueTextSize = valueSize === "lg" ? "text-lg" : "text-sm";

  return (
    <div className={`bg-secondary/60 rounded-md p-3 space-y-1 relative ${className}`}>
      {Icon && (
        <Icon className={`w-4 h-4 text-muted-foreground absolute top-2 right-2 ${iconClassName}`} />
      )}
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className={`${valueTextSize} font-bold text-foreground leading-none ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
