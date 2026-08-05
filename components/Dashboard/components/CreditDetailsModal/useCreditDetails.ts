"use client";
import { useCallback, useEffect, useState } from "react";
import type { AmortizacionRow, ClientRequestRecord } from "@/types/client-request";
import { formatPaymentFrequency } from "@/utils/formatters";
import { updateActiveRequestData } from "@/services/client-requests";
import { calculateScore, type EvaluateScoreResponse } from "@/services/onboarding/evaluate-score";
import confetti from "canvas-confetti";
import { Shield, ShieldCheck } from "@/lib/icons";
import {
  calculateCreditBreakdown,
  type CreditBreakdownInput,
} from "@/utils/calculateCreditBreakdown";
import { useCreditDetailsStore } from "@/stores/credit-details-store";

const CONFETTI_Z_INDEX = 9999;

// Definir los iconos con tipo seguro
const ICONS = { "shield-check": ShieldCheck, shield: Shield } as const;
type IconKey = keyof typeof ICONS;

// Función helper para obtener el icono de forma segura
const getIcon = (key: string | undefined): React.ComponentType<any> => {
  if (key && key in ICONS) {
    return ICONS[key as IconKey];
  }
  return Shield; // Fallback al icono por defecto
};

export const useCreditDetails = (credit: ClientRequestRecord) => {
  const data = credit.data;

  const montoOfertado =
    Number(data.monto_ofertado) || Number(data.monto_solicitado) || 0;
  const evaluationId = data.evaluation_id ?? "";

  // Caché del detalle por evaluation_id: evita re-peticiones al backend
  // al reabrir el modal. Se limpia al presionar "Actualizar solicitudes".
  const cached = useCreditDetailsStore((state) =>
    state.detailsCache[evaluationId],
  );

  // Función para construir el CreditBreakdownInput desde los datos del endpoint
  const buildCreditInput = useCallback(
    (endpointData: any): CreditBreakdownInput => {
      return {
        tipo_de_credito_solicitado:
          data.tipo_de_credito_ofertado ??
          data.tipo_de_credito_solicitado ??
          "essential",
        pago_por_periodo_sin_seguros:
          endpointData.pago_por_periodo_sin_seguros ?? 0,
        pago_por_periodo_con_seguros_iva:
          endpointData.pago_por_periodo_con_seguros_iva ?? 0,
        numero_de_periodos: endpointData.numero_de_periodos ?? 0,
        monto_total_a_pagar: endpointData.monto_total_a_pagar ?? 0,
        comision_apertura: endpointData.comision_apertura ?? 0,
        seguro_vida:
          endpointData.seguro_vida_al_millar ?? endpointData.seguro_vida ?? 0,
        seguro_invalidez_total_permanente:
          endpointData.seguro_invalidez_al_millar ??
          endpointData.seguro_invalidez_total_permanente ??
          0,
      };
    },
    [data.tipo_de_credito_ofertado, data.tipo_de_credito_solicitado],
  );

  // Función para calcular el crédito
  const calculateCredit = useCallback(
    (endpointData: any) => {
      const creditInput = buildCreditInput(endpointData);
      const result = calculateCreditBreakdown(creditInput, montoOfertado);
      return result;
    },
    [buildCreditInput, montoOfertado],
  );

  const [showSuccess, setShowSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"detalles" | "amortizacion">("detalles");
  const [isLoading, setIsLoading] = useState(!cached);
  const [creditData, setCreditData] = useState<any>(() =>
    cached ? calculateCredit(cached.scoreData) : null,
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<EvaluateScoreResponse | null>(
    cached?.scoreData ?? null,
  );
  const [amortizacion, setAmortizacion] = useState<AmortizacionRow[]>(
    cached?.scoreData.tabla_amortizacion ?? [],
  );

  // Obtener datos del endpoint (o usar la caché si ya se pidieron antes)
  useEffect(() => {
    if (cached) return;

    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        if (!evaluationId) {
          setFetchError("No se pudo obtener la información del crédito.");
          setIsLoading(false);
          return;
        }

        const result = await calculateScore({
          action: "calculate",
          evaluation_id: evaluationId,
          monto_solicitado: montoOfertado,
        });

        if (result) {
          setScoreData(result);
          setCreditData(calculateCredit(result));

          if (result.tabla_amortizacion) {
            setAmortizacion(result.tabla_amortizacion);
          }

          useCreditDetailsStore
            .getState()
            .setCreditDetails(evaluationId, {
              scoreData: result,
              fetchedAt: Date.now(),
            });
        } else {
          setFetchError("No se recibieron datos del servidor.");
        }
      } catch (error) {
        setFetchError(
          "Ocurrió un error al obtener la información del crédito. Por favor, intenta más tarde.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId, cached]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!showSuccess) return;

    const end = Date.now() + 5 * 1000;
    const colors = ["#E1941F", "#FFFFFF"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        zIndex: CONFETTI_Z_INDEX,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        zIndex: CONFETTI_Z_INDEX,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [showSuccess]);

  const handleAccept = async () => {
    setIsUpdating(true);
    setError("");
    try {
      await updateActiveRequestData({
        estado: "approved",
        ...(scoreData
          ? {
              perfil: scoreData.perfil,
              historial_crediticio_usado:
                scoreData.historial_crediticio_usado ?? "",
              score_consolidado: String(scoreData.score_consolidado),
              score_ajustado: String(scoreData.score_ajustado),
              probabilidad_rotacion_promedio: String(
                scoreData.probabilidad_rotacion_promedio,
              ),
              sueldo_neto_mensual: scoreData.sueldo_neto_mensual,
              capacidad_endeudamiento_max:
                scoreData.capacidad_endeudamiento_max,
              tasa_mensual_sin_iva: parseFloat(scoreData.tasa_mensual_sin_iva),
              seguro_vida_al_millar: scoreData.seguro_vida_al_millar,
              seguro_invalidez_al_millar: scoreData.seguro_invalidez_al_millar,
              comision_apertura: scoreData.comision_apertura,
              pago_por_periodo_sin_seguros:
                scoreData.pago_por_periodo_sin_seguros,
              pago_por_periodo_con_seguros_iva:
                scoreData.pago_por_periodo_con_seguros_iva,
              numero_de_periodos: scoreData.numero_de_periodos,
              monto_total_a_pagar: scoreData.monto_total_a_pagar,
              monto_total_a_pagar_con_seguros:
                scoreData.monto_total_a_pagar_con_seguros,
              evaluation_id: scoreData.evaluation_id ?? evaluationId,
              tabla_amortizacion: scoreData.tabla_amortizacion,
            }
          : {}),
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la solicitud.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Datos para mostrar
  const frecuenciaDePago = formatPaymentFrequency(
    data.frecuencia_de_pago_ofertada ?? data.frecuencia_de_pago_solicitada,
  );
  const plazo = data.plazo_ofertado ?? data.plazo_solicitado;
  const TipoIcon = creditData ? getIcon(creditData.iconKey) : Shield;

  return {
    showSuccess,
    isUpdating,
    error,
    tab,
    setTab,
    amortizacion,
    isLoading,
    creditData,
    fetchError,
    montoOfertado,
    frecuenciaDePago,
    plazo,
    TipoIcon,
    handleAccept,
  };
};
