import { AlertCircle } from "@/lib/icons";

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
}

/**
 * Bloque de error visible. Solo renderiza si `message` tiene contenido.
 *
 * Uso:
 *   <ErrorMessage message={fetchError} />
 *   <ErrorMessage message={error} className="mt-2" />
 */
export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 ${className}`}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" aria-hidden="true" />
      <p className="text-sm text-destructive leading-snug">{message}</p>
    </div>
  );
}
