import type { ClientRequestData } from "@/types/client-request";

export type DashboardRequestStatus = NonNullable<ClientRequestData["estado"]>;

export interface EstadoConfigItem {
  label: string;
  className: string;
  dot: string;
}

export const ESTADO_CONFIG: Record<DashboardRequestStatus, EstadoConfigItem> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resuelto",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  approved: {
    label: "Aprobado",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  active: {
    label: "Activo",
    className: "bg-brand-accent/10 text-brand-accent",
    dot: "bg-brand-accent",
  },
  completed: {
    label: "Completado",
    className: "bg-brand-dark/10 text-brand-dark",
    dot: "bg-brand-dark",
  },
  denied: {
    label: "Denegado",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};
