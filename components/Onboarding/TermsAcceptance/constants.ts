interface LegalDocumentContent {
  paragraphs: string[];
  bullets?: string[];
  sections?: Array<{
    title: string;
    text?: string;
    bullets?: string[];
    afterText?: string;
  }>;
  legalNote?: string;
}

interface LegalDocument {
  id: string;
  title: string;
  url?: string;
  content?: LegalDocumentContent;
}

export const DOCUMENTS: LegalDocument[] = [
  {
    id: "advertising",
    title: "Autorización para efectos publicitarios y mercadotécnicos (REUS)",
    content: {
      paragraphs: [
        "WECOME, S.A.P.I. DE C.V., SOFOM, E.N.R. podrá, por conducto propio o a través de sus prestadores de servicios debidamente facultados, utilizar tus datos personales y datos de contacto para fines mercadotécnicos o publicitarios relacionados con la promoción de sus productos y servicios financieros.",
        "Al otorgar tu autorización, aceptas que WECOME podrá:",
        "Esta autorización tendrá vigencia durante la relación contractual derivada de tu crédito.",
      ],
      bullets: [
        "Enviar publicidad a tu domicilio.",
        "Realizar llamadas telefónicas a tus números de contacto.",
        "Enviar mensajes de texto (SMS), mensajería instantánea y/o notificaciones.",
        "Enviar correos electrónicos con información sobre su oferta de productos y servicios financieros.",
      ],
      sections: [
        {
          title: "Modificación de autorización",
          text: "En términos del artículo 158 de la Disposición en Materia de Registros ante la Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros (CONDUSEF), podrás revocar o modificar esta autorización en cualquier momento, mediante solicitud por escrito presentada en cualquier sucursal o medio de atención autorizado por WECOME.",
        },
        {
          title: "Declaración sobre REUS",
          text: "Si te encuentras inscrito en el Registro Público de Usuarios (REUS) por no autorizar que tus datos personales sean utilizados para fines mercadotécnicos o publicitarios por otras instituciones financieras, con esta autorización expresas que sí autorizas a WECOME a utilizar tu información exclusivamente para la promoción de sus propios productos y servicios financieros. WECOME no podrá compartir tu información con instituciones financieras, personas morales ajenas a ella o terceros distintos de sus prestadores de servicios autorizados, conforme al artículo 159 de la misma Disposición.",
        },
      ],
      legalNote:
        "Cumplimiento de los artículos 158, 159, 160 y 161 de la Disposición en Materia de Registros ante la CONDUSEF.",
    },
  },
  {
    id: "transparency",
    title: "Aviso de Transparencia y Acceso a la Información Pública",
    content: {
      paragraphs: [
        "Datos de contacto de la Sociedad:",
        "Domicilio: Calle Porfirio Díaz número 7, Col. Jardines de Atizapán, C.P. 52978, Atizapán de Zaragoza, Estado de México.",
        "Correo electrónico: datospersonales@wecome.mx",
        "Teléfono: 5558122112",
      ],
      sections: [
        {
          title: "I. Identificación de la Sociedad",
          text: "WECOME, S.A.P.I. de C.V., SOFOM, E.N.R. (la Sociedad) es una Sociedad Financiera de Objeto Múltiple, Entidad No Regulada, debidamente constituida conforme a las leyes de los Estados Unidos Mexicanos, cuyo objeto social principal es la realización habitual y profesional de operaciones de crédito y demás actividades financieras permitidas por la legislación aplicable.",
        },
        {
          title: "II. Marco normativo",
          text: "La Sociedad opera conforme a lo dispuesto por la Ley General de Organizaciones y Actividades Auxiliares del Crédito y demás disposiciones financieras y mercantiles aplicables. En su carácter de SOFOM, E.N.R., la Sociedad no tiene el carácter de sujeto obligado directo en términos de la Ley General de Transparencia y Acceso a la Información Pública, al no formar parte de la Administración Pública ni ejercer recursos públicos, salvo que participe en programas específicos bajo dicho esquema. No obstante, la Sociedad adopta principios de transparencia, legalidad y rendición de cuentas en el desarrollo de sus actividades.",
        },
        {
          title: "III. Información disponible al público",
          text: "La Sociedad pone a disposición del público:",
          bullets: [
            "Denominación social y datos de identificación.",
            "Domicilio y medios de contacto.",
            "Descripción de productos y servicios financieros.",
            "Costos, comisiones y tasas aplicables.",
            "Requisitos de contratación.",
            "Información corporativa básica.",
            "Aviso de Privacidad vigente.",
          ],
        },
        {
          title: "IV. Solicitudes de información",
          text: "Cualquier persona podrá solicitar información relacionada con los servicios ofrecidos por la Sociedad a través de:",
          bullets: [
            "Correo electrónico: contacto@wecome.mx",
            "Domicilio: Calle Porfirio Díaz número 7, Col. Jardines de Atizapán, C.P. 52978, Atizapán de Zaragoza, Estado de México.",
            "Teléfono: 5558122112",
          ],
          afterText:
            "Las solicitudes serán atendidas en un plazo razonable, conforme a la naturaleza de la información solicitada y respetando las disposiciones legales aplicables.",
        },
        {
          title: "V. Limitaciones a la entrega de información",
          text: "No podrá proporcionarse información que contenga datos personales protegidos, esté sujeta a secreto financiero o a confidencialidad contractual, se encuentre protegida por disposiciones en materia de prevención de lavado de dinero, o sea considerada estratégica o reservada por medios oficiales.",
        },
        {
          title: "VI. Protección de datos personales",
          text: "El tratamiento de datos personales se rige por el Aviso de Privacidad vigente de la Sociedad, disponible a través de sus medios oficiales.",
        },
        {
          title: "VII. Actualizaciones",
          text: "El presente Aviso podrá ser modificado en cualquier momento para reflejar cambios legales, regulatorios o internos. La versión vigente estará disponible a través de los medios oficiales de la Sociedad.",
        },
      ],
    },
  },
  {
    id: "privacy",
    title: "Aviso de Privacidad Integral",
    content: {
      paragraphs: [],
      sections: [
        {
          title: "1. Responsable de los datos",
          text: "En cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de Particulares (La Ley), WECOME Sociedad Anónima Promotora de Inversión de Capital Variable, Sociedad Financiera de Objeto Múltiple, Entidad No Regulada, con domicilio en Calle Porfirio Díaz número 7, Colonia Jardines de Atizapán, C.P. 52978, Atizapán de Zaragoza, Estado de México, es responsable del uso y protección de tus datos personales. Debes informar a tus beneficiarios o referencias sobre el uso de sus datos personales conforme a este aviso.",
        },
        {
          title: "2. Datos personales que recabamos",
          text: "",
          bullets: [
            "Datos de identificación.",
            "Datos de contacto.",
            "Datos patrimoniales y financieros.",
            "Datos personales sensibles.",
          ],
        },
        {
          title: "3. Finalidades primordiales (como prospecto y cliente)",
          text: "",
          bullets: [
            "Revalidar y verificar tu identidad como Titular de los Datos.",
            "Registrarte como cliente nuevo, actualizar y consultar tus datos.",
            "Establecer y administrar tu contrato o préstamo con WECOME.",
            "Identificarte a través de referencias personales para comunicados en tu nombre si no eres localizado por medios habituales.",
            "Solicitar referencias y dar seguimiento de tus obligaciones ante el buró de crédito.",
            "Identificar descuentos vía nómina, cuando proceda.",
            "Enviar tu tabla de amortización de forma electrónica, a solicitud.",
            "Sustentar auditorías requeridas por la autoridad regulatoria.",
            "Integrar tu expediente como Titular de los Datos.",
          ],
        },
        {
          title: "4. Uso de datos sensibles",
          text: "Autenticar tu identidad y hacer constar tu voluntad en WECOME a través de tus datos biométricos.",
        },
        {
          title: "5. Finalidades secundarias (usos complementarios)",
          text: "Puedes oponerte a estas finalidades secundarias sin que esto afecte el servicio contratado, a través del Anexo Formato para fines publicitarios y mercadotécnicos, o directamente en: Correo: datospersonales@wecome.mx. Teléfono: +52 1 56 5765 7825.",
          bullets: [
            "Notificarte sobre nuevos servicios o productos de WECOME.",
            "Contactarte para evaluar la calidad del servicio.",
            "Obtención de testimoniales, encuestas y entrevistas.",
          ],
        },
        {
          title: "6. Transferencia de datos personales",
          text: "WECOME no realizará transferencias de tus datos a terceros no mencionados en este aviso sin tu consentimiento previo, salvo las excepciones del artículo 37 de la Ley.",
        },
        {
          title: "7. Derechos ARCO",
          text: "Como Titular de los Datos, o tu representante legal, puedes ejercer en cualquier momento tus derechos de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO), así como revocar tu consentimiento. WECOME te informará en un plazo máximo de 20 días si tu solicitud es procedente y, en su caso, será efectiva dentro de los 15 días hábiles siguientes. La cancelación de datos puede no ser inmediata si existe una obligación legal que requiera continuar su tratamiento.",
          bullets: [
            "Correo: datospersonales@wecome.mx.",
            "Teléfono: 56 5765 7825, horario de 9:00 a 16:00 hrs.",
          ],
        },
        {
          title: "8. Revocación del consentimiento",
          text: "Puedes revocar el consentimiento otorgado para el tratamiento de tus datos, aunque WECOME podría continuar usándolos si existe una obligación legal relacionada con identificación, evaluación y administración de créditos, cumplimiento regulatorio, prevención de fraudes y lavado de dinero, o atención a requerimientos de autoridad.",
          bullets: [
            "Teléfono: 56 5765 7825.",
            "Correo: datospersonales@wecome.mx.",
          ],
        },
        {
          title: "9. Opciones para limitar el uso de tus datos",
          text: "",
          bullets: [
            "Inscripción en el Registro Público de Usuarios (REUS) para no recibir publicidad de productos o servicios financieros.",
            "Registro en el listado de exclusión de WECOME para fines mercadotécnicos, publicitarios o de prospección comercial.",
          ],
        },
        {
          title: "10. Uso de cookies",
          text: "El sitio wecome.mx utiliza cookies propias y de terceros para identificar páginas más visitadas y medir la eficacia de campañas publicitarias, con el fin de mejorar la calidad del servicio. Puedes restringir, bloquear o borrar las cookies desde la configuración de tu navegador.",
        },
        {
          title: "11. Cambios al aviso de privacidad",
          text: "Este aviso puede actualizarse por nuevos requerimientos legales, mejoras en el servicio o cambios en el modelo de negocio. Las actualizaciones se publicarán en www.wecome.mx y en avisos en sucursales.",
        },
      ],
      legalNote:
        "Oficina de Datos Personales: Teléfono 56 5765 7825. Correo: datospersonales@wecome.mx.",
    },
  },
  {
    id: "insurance",
    title: "Autorización para contratación de seguro",
    content: {
      paragraphs: [
        "El Acreditado, en este acto otorga su consentimiento expreso y autorización para que WECOME, S.A.P.I. de C.V., SOFOM, E.N.R. gestione a su nombre y representación la contratación de un seguro de vida que garantice el cumplimiento del Contrato de Crédito en caso de fallecimiento, cuyos gastos, cuotas y derechos serán cubiertos por su cuenta a favor de WECOME, S.A.P.I. de C.V., SOFOM, E.N.R.",
        "Bajo dicha tesitura, el Acreditado reconoce que:",
      ],
      bullets: [
        "El contrato de seguro es independiente del Contrato de Crédito.",
        "La cancelación del seguro no cancela el crédito.",
        "En caso de incumplimiento o prepago total, WECOME podrá cancelar el seguro.",
      ],
      legalNote:
        "Para su constitución y operación con tal carácter, WECOME no requiere autorización de la Secretaría de Hacienda y Crédito Público. Está sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores únicamente para efectos de lo dispuesto por el artículo 56 de la Ley General de Organizaciones y Actividades Auxiliares del Crédito.",
    },
  },
  {
    id: "terms",
    title:
      "Wecom Crédito Impulso Pyme e Impulso Personal — Términos y Condiciones",
    content: {
      paragraphs: [],
      sections: [
        {
          title: "1. Definiciones",
          bullets: [
            "WECOME: Plataforma digital operada por la entidad otorgante del crédito.",
            "Cliente: Persona física o moral que solicita y contrata el crédito.",
            "Crédito Simple con aval y sin garantía: Financiamiento cuyo pago se realiza mediante parcialidades.",
            "CAT: Costo Anual Total promedio sin IVA, de referencia informativa.",
            "Capa de Protección™: Cobertura aplicable únicamente si el cliente contrata algún seguro.",
          ],
        },
        {
          title: "2. Objeto del contrato",
          text: "Este documento regula los términos bajo los cuales WECOME otorga al Cliente un crédito de consumo, conforme a las condiciones particulares cuyo monto, plazo, tasa y condiciones se especifican en la solicitud, el contrato individual y la carátula del crédito.",
        },
        {
          title: "3. Condiciones financieras",
          text: "El CAT es el Costo Anual Total de financiamiento, expresado en términos porcentuales anuales, que para fines informativos y de comparación incorpora la totalidad de los costos y gastos inherentes al crédito.",
          bullets: [
            "Monto: [monto_solicitado] MXN",
            "Plazo: [numero_de_periodos] periodos",
            "Tasa de interés: determinada mediante Tasa Inteligente™",
            "CAT promedio: [cat]% anual sin IVA — informativo, sujeto a aprobación de crédito.",
          ],
        },
        {
          title: "4. Forma de pago",
          text: "El pago se realiza mediante descuento automático vía nómina como medio principal. En caso de imposibilidad, el Cliente deberá cubrir sus obligaciones por medios alternos autorizados. Los pagos se aplican conforme al calendario y tabla de amortización establecidos.",
        },
        {
          title: "5. Cobertura (opcional)",
          text: "El producto puede incluir coberturas de seguro sujetas a los términos de la aseguradora correspondiente. Los seguros son opcionales y solo aplican con autorización expresa e informada del Cliente, conforme a la normativa de transparencia financiera. Su contratación puede implicar un costo adicional incluido en el crédito.",
        },
        {
          title: "6. Uso del servicio (Softphone)",
          text: "El Cliente acepta:",
          bullets: [
            "Ser contactado por WECOME vía llamada, app o medios digitales.",
            "Utilizar el canal para soporte, cobranza y seguimiento.",
            "Que las llamadas puedan ser grabadas para calidad y cumplimiento.",
          ],
        },
        {
          title: "7. Intereses y comisiones",
          text: "Los intereses se calculan sobre saldo insoluto. Podrán aplicarse comisiones por:",
          bullets: ["Apertura", "Administración", "Mora", "Cobranza"],
          afterText:
            "Las comisiones por administración de cuenta, las derivadas de servicios prestados por terceros y la contratación de seguros asociados tienen carácter opcional y únicamente serán aplicables previa autorización expresa, libre e informada del Cliente, conforme al contrato de crédito y la normativa de transparencia y protección al usuario de servicios financieros.",
        },
        {
          title: "8. Comisiones a terceros",
          text: "Cualquier comisión, honorario o pago adicional derivado de la intervención de terceros, intermediarios, asesores o comisionistas para la obtención del crédito o gestión de trámites será responsabilidad exclusiva del Cliente. WECOME no reconoce, no cubre ni se hace responsable por dichos pagos a terceros.",
        },
        {
          title: "9. Incumplimiento",
          text: "En caso de falta de pago:",
          bullets: [
            "Se generarán intereses moratorios.",
            "WECOME podrá iniciar acciones de cobranza.",
            "El historial podrá ser reportado al Buró de Crédito.",
          ],
        },
        {
          title: "10. Protección de datos",
          text: "WECOME tratará los datos personales conforme a la Ley Federal de Protección de Datos Personales y al Aviso de Privacidad disponible en www.wecome.mx.",
        },
        {
          title: "11. Autorización de consulta",
          text: "El Cliente autoriza a WECOME a consultar y reportar su historial crediticio en las sociedades de información crediticia, incluyendo:",
          bullets: [
            "Consulta en Buró de Crédito.",
            "Uso de información financiera y laboral.",
            "Evaluación automatizada.",
          ],
        },
        {
          title: "12. Regulación",
          text: "Producto de crédito al consumo, regido por legislación mexicana. Supervisión aplicable por la CNBV y CONDUSEF.",
        },
        {
          title: "13. Cancelación",
          text: "El Cliente podrá:",
          bullets: [
            "Liquidar anticipadamente sin penalización (si aplica).",
            "Solicitar cancelación conforme a las condiciones del contrato.",
          ],
        },
        {
          title: "14. Notificaciones",
          text: "WECOME podrá enviar notificaciones de pago, ofertas y comunicaciones operativas.",
        },
        {
          title: "15. Responsabilidad del cliente",
          text: "El Cliente se compromete a:",
          bullets: [
            "Proporcionar información veraz.",
            "Cumplir con los pagos.",
            "Mantener actualizados sus datos.",
          ],
        },
        {
          title: "16. Aceptación de términos y condiciones",
          text: "Declaración: “He leído, comprendido y acepto en su totalidad los términos y condiciones establecidos en el presente documento, así como las condiciones particulares del crédito que me han sido informadas previamente por WECOME, S.A.P.I. de C.V., SOFOM, E.N.R.”",
        },
      ],
    },
  },
];
