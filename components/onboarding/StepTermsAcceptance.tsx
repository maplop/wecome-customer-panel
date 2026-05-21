'use client'

import { useState, useEffect } from 'react'

interface StepTermsAcceptanceProps {
  onNext: () => void
  onBack: () => void
}

const DOCUMENTS = [
  {
    id: 'advertising',
    title: 'Autorización de publicidad',
    description: 'Autorizo el uso de mis datos para fines publicitarios y de mercadotecnia por parte de Wecome.',
    content: `AUTORIZACIÓN DE PUBLICIDAD

Por medio del presente, otorgo mi consentimiento libre, expreso e informado a WECOME, S.A. de C.V. (en adelante "Wecome") para el tratamiento de mis datos personales con fines de prospección comercial, publicidad y mercadotecnia.

Alcance de la autorización:

1. Comunicaciones comerciales: Autorizo a Wecome a enviarme comunicaciones, promociones, ofertas y publicidad relacionada con sus productos y servicios financieros, incluyendo pero no limitado a créditos de nómina, seguros y productos complementarios.

2. Canales de contacto: Las comunicaciones podrán realizarse a través de los siguientes medios:
   - Correo electrónico
   - Llamadas telefónicas
   - Mensajes de texto SMS
   - Notificaciones push en aplicaciones móviles
   - Redes sociales y plataformas digitales

3. Perfilamiento comercial: Autorizo a Wecome a realizar análisis de perfiles y segmentación con base en mi información financiera y de consumo para ofrecer productos que se ajusten a mis necesidades.

4. Vigencia: La presente autorización tendrá vigencia a partir de su aceptación y hasta que el titular manifieste su revocación expresa mediante los canales establecidos por Wecome.

5. Revocación: El titular podrá revocar la presente autorización en cualquier momento contactando a Wecome a través de los canales de atención al cliente establecidos en el Aviso de Privacidad.

6. Derechos ARCO: El titular podrá ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) en los términos establecidos en el Aviso de Privacidad de Wecome.

Al aceptar el presente documento, confirmo que he leído y entendido el alcance de la autorización otorgada.`,
  },
  {
    id: 'privacy',
    title: 'Aviso de privacidad Wecome',
    description: 'He leído y entiendo el aviso de privacidad de Wecome, incluyendo el tratamiento de mis datos personales.',
    content: `AVISO DE PRIVACIDAD WECOME

WECOME, S.A. de C.V. (en adelante "Wecome"), con domicilio en la Ciudad de México, es el responsable del tratamiento de sus datos personales.

Datos personales recabados:

1. Datos de identificación: Nombre completo, fecha de nacimiento, nacionalidad, estado civil, CURP, RFC, y firma autógrafa.

2. Datos de contacto: Domicilio, teléfono fijo y móvil, correo electrónico.

3. Datos laborales: Ocupación, puesto, ingresos, antigüedad laboral, nombre y domicilio del empleador.

4. Datos patrimoniales: Cuentas bancarias, historial crediticio, referencias personales y patrimoniales.

5. Datos biométricos: Fotografía, huella dactilar y firma electrónica (únicamente para fines de identificación y seguridad).

Finalidades del tratamiento:

Finalidades primarias:
- Evaluación de solicitudes de crédito y productos financieros
- Contratación y administración de productos y servicios
- Cumplimiento de obligaciones legales y regulatorias
- Prevención de fraudes y lavado de dinero
- Atención a clientes y gestión de quejas y aclaraciones

Finalidades secundarias:
- Prospección comercial y publicidad
- Análisis de perfiles y segmentación comercial
- Encuestas de satisfacción y calidad

Transferencia de datos:

Wecome podrá transferir sus datos personales a:
- Autoridades financieras y regulatorias (CNBV, CONDUSEF, SAT)
- Burós de crédito y sociedades de información crediticia
- Proveedores de servicios de verificación de identidad
- Aseguradoras y afianzadoras
- Despachos de cobranza externos

Derechos ARCO:

Usted tiene derecho a:
- Acceso: Conocer qué datos personales tenemos y cómo los utilizamos
- Rectificación: Solicitar la corrección de sus datos si son inexactos
- Cancelación: Solicitar la eliminación de sus datos
- Oposición: Oponerse al tratamiento de sus datos para fines específicos

Para ejercer sus derechos ARCO, puede contactarnos a través de:
- Correo electrónico: privacidad@wecome.mx
- Teléfono: 800 999 8080
- Domicilio: Insurgentes Sur 1234, Col. Del Valle, CDMX

Modificaciones al aviso de privacidad:

Cualquier modificación a este aviso será comunicada a través de nuestros canales oficiales y en nuestro sitio web.

Fecha de última actualización: Enero 2025`,
  },
  {
    id: 'insurance',
    title: 'Autorización de seguro Wecome',
    description: 'Autorizo la contratación del seguro asociado al crédito de nómina en los términos establecidos.',
    content: `AUTORIZACIÓN DE SEGURO WECOME

Por medio del presente, autorizo expresamente a WECOME, S.A. de C.V. (en adelante "Wecome") a contratar el seguro de vida asociado a mi crédito de nómina, en los términos y condiciones que se describen a continuación.

Términos del seguro:

1. Cobertura: Seguro de vida por el monto total del crédito contratado, con cobertura por fallecimiento del titular.

2. Beneficiario: El beneficiario del seguro será Wecome hasta por el monto del saldo insoluto del crédito. El excedente, en su caso, será entregado a los beneficiarios designados por el titular.

3. Prima: El costo del seguro será equivalente al 2% (dos por ciento) del monto total del crédito, mismo que será financiado dentro del plan de pagos del crédito.

4. Vigencia: La cobertura del seguro iniciará a partir de la fecha de disposición del crédito y permanecerá vigente hasta la liquidación total del mismo.

5. Cobertura por incapacidad: El seguro también cubre incapacidad total y permanente del titular, liberando el saldo insoluto del crédito.

6. Exclusiones: Quedan excluidos de la cobertura los siniestros derivados de:
   - Enfermedades preexistentes no declaradas
   - Actividades de alto riesgo no informadas
   - Suicidio durante el primer año de vigencia
   - Muerte por intoxicación alcohólica o consumo de sustancias ilícitas

7. Aseguradora: La póliza será emitida por una aseguradora autorizada por la Comisión Nacional de Seguros y Fianzas, la cual será notificada al titular al momento de la contratación.

8. Cancelación: El titular podrá cancelar el seguro en cualquier momento mediante solicitud expresa, sin que ello afecte las condiciones del crédito.

Al aceptar el presente documento, confirmo que he leído y entendido los términos y condiciones del seguro asociado a mi crédito de nómina.`,
  },
  {
    id: 'creditHistory',
    title: 'Autorización de historial crediticio',
    description: 'Autorizo a Wecome a consultar y analizar mi historial crediticio en burós de crédito.',
    content: `AUTORIZACIÓN DE CONSULTA DE HISTORIAL CREDITICIO

Por medio del presente, otorgo mi consentimiento expreso e informado a WECOME, S.A. de C.V. (en adelante "Wecome") para llevar a cabo la consulta de mi historial crediticio ante las Sociedades de Información Crediticia (Burós de Crédito) que correspondan.

Objeto de la autorización:

1. Consulta inicial: Autorizo a Wecome a consultar mi historial crediticio con la finalidad de evaluar mi solicitud de crédito y determinar mi capacidad de pago, así como para la integración de mi expediente crediticio.

2. Consultas periódicas: Autorizo a Wecome a realizar consultas periódicas a mi historial crediticio durante la vigencia de cualquier relación contractual, con la finalidad de dar seguimiento a mi comportamiento crediticio y evaluar posibles modificaciones, renovaciones o ampliaciones de línea de crédito.

3. Reporte de información: Autorizo a Wecome a reportar a las Sociedades de Información Crediticia mi comportamiento de pago, incluyendo el cumplimiento puntual o morosidad en mis obligaciones crediticias.

4. Sociedades de Información Crediticia: Las consultas podrán realizarse ante:
   - Círculo de Crédito, S.A. de C.V.
   - Buró de Crédito, S.A. de C.V.
   - Cualquier otra Sociedad de Información Crediticia autorizada por la Secretaría de Hacienda y Crédito Público

5. Finalidades: La información obtenida será utilizada exclusivamente para:
   - Evaluación y autorización de créditos
   - Administración y seguimiento de cartera
   - Prevención de fraudes
   - Cumplimiento de disposiciones regulatorias aplicables

6. Reconocimiento: Declaro conocer que, en caso de resultar negativo mi historial crediticio, Wecome podrá determinar no otorgar el crédito solicitado o modificar las condiciones del mismo.

7. Derechos: Reconozco mi derecho a solicitar a Wecome el nombre de la Sociedad de Información Crediticia ante la cual se realizó la consulta, así como a obtener de dicha sociedad mi Reporte de Crédito Especial.

Al aceptar el presente documento, confirmo que he leído y entendido el alcance de la autorización otorgada para la consulta de mi historial crediticio.`,
  },
]

export default function StepTermsAcceptance({ onNext, onBack }: StepTermsAcceptanceProps) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({
    advertising: false,
    privacy: false,
    insurance: false,
    creditHistory: false,
  })
  const [modalDoc, setModalDoc] = useState<string | null>(null)

  const allAccepted = Object.values(accepted).every(Boolean)

  useEffect(() => {
    if (modalDoc) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalDoc])

  const handleAcceptInModal = () => {
    if (modalDoc) {
      setAccepted(prev => ({ ...prev, [modalDoc]: true }))
      setModalDoc(null)
    }
  }

  const activeDoc = DOCUMENTS.find(d => d.id === modalDoc)

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground text-balance">
            Términos y condiciones
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para continuar, lee y acepta los siguientes documentos legales.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {DOCUMENTS.map((doc) => {
            const checked = accepted[doc.id]
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setModalDoc(doc.id)}
                className="w-full rounded-xl border border-border p-4 flex items-start gap-3 text-left transition hover:bg-secondary/50 active:scale-[0.99]"
              >
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition ${checked ? 'border-transparent' : 'border-border'}`}
                    style={checked ? { backgroundColor: '#E1941F' } : {}}
                  >
                    {checked && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">{doc.title}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{doc.description}</span>
                </div>

              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onNext}
            disabled={!allAccepted}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Document modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-foreground">{activeDoc.title}</h2>
              <button
                type="button"
                onClick={() => setModalDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition"
                aria-label="Cerrar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                {activeDoc.content}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAcceptInModal}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#E1941F' }}
              >
                Aceptar y cerrar
              </button>
              <button
                type="button"
                onClick={() => setModalDoc(null)}
                className="w-full rounded-xl border border-border py-3.5 text-sm font-medium text-foreground transition hover:bg-secondary active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
