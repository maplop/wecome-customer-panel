'use client'

interface StepPersonalDataProps {
  onNext: () => void
  onBack: () => void
}

const MOCK_DATA = {
  nombreCompleto: 'Juan Carlos Pérez González',
  rfc: 'PEGJ850101HDF',
  curp: 'PEGJ850101HDFXXXXX',
  fechaNacimiento: '01/01/1985',
  edad: '41 años',
  nacionalidad: 'Mexicana',
  estadoCivil: 'Casado / Separación de bienes',
  telefono: '55 1234 5678',
  correo: 'juan.perez@email.com',
}

interface DataRowProps {
  label: string
  value: string
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export default function StepPersonalData({ onNext, onBack }: StepPersonalDataProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Datos personales
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verifica que tus datos sean correctos antes de continuar.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex flex-col gap-1">
        <DataRow label="Nombre completo" value={MOCK_DATA.nombreCompleto} />
        <DataRow label="RFC" value={MOCK_DATA.rfc} />
        <DataRow label="CURP" value={MOCK_DATA.curp} />
        <DataRow label="Fecha de nacimiento" value={MOCK_DATA.fechaNacimiento} />
        <DataRow label="Edad" value={MOCK_DATA.edad} />
        <DataRow label="Nacionalidad" value={MOCK_DATA.nacionalidad} />
        <DataRow label="Estado civil" value={MOCK_DATA.estadoCivil} />
        <DataRow label="Teléfono" value={MOCK_DATA.telefono} />
        <DataRow label="Correo electrónico" value={MOCK_DATA.correo} />
      </div>

      <div className="rounded-xl bg-blue-50 p-4 flex items-start gap-3 border border-blue-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-xs text-blue-800 leading-relaxed">
          Estos datos fueron obtenidos de tu información fiscal y CURP. Si detectas algún error, contacta a soporte.
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90"
        style={{ backgroundColor: '#E1941F' }}
      >
        Continuar
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
      >
        Regresar
      </button>
    </div>
  )
}