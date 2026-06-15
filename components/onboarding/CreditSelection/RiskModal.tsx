import { useState } from "react"
import { AlertTriangle } from '@/lib/icons'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'


export default function RiskModal({
  onAccept,
  onCancel,
}: {
  onAccept: () => void
  onCancel: () => void
}) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent"
            >
              <AlertTriangle className="stroke-white w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Crédito sin seguro</h2>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="rounded-xl bg-brand-warning/10 border border-brand-warning/30 p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-brand-warning">Aviso importante</p>
            <p className="text-sm text-brand-warning/80 leading-relaxed">
              Al seleccionar un crédito <strong>sin seguro</strong>, asumes los siguientes riesgos:
            </p>
            <ul className="text-sm text-brand-warning/80 space-y-1.5 list-disc list-inside">
              <li>En caso de incapacidad temporal, el pago del crédito sigue siendo tu responsabilidad.</li>
              <li>En caso de fallecimiento, el saldo pendiente será cobrado a tus beneficiarios o avales.</li>
              <li>No cuentas con protección ante pérdida involuntaria de empleo.</li>
              <li>Las tasas de interés pueden ser más altas que en un crédito con seguro.</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="risk-accept"
              checked={checked}
              onCheckedChange={(val) =>
                setChecked(val === true)
              }
              className="mt-0.5 border-brand-accent bg-transparent data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent data-[state=checked]:text-white"
            />
            <Label
              htmlFor="risk-accept"
              className="text-xs text-muted-foreground"
            >
              Entiendo y acepto los riesgos de contratar un crédito sin seguro. Asumo la responsabilidad total del pago en las situaciones descritas.
            </Label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
          <button
            type="button"
            disabled={!checked}
            onClick={onAccept}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-brand-accent"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl py-3.5 text-sm font-medium text-foreground border border-border transition hover:bg-secondary active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
