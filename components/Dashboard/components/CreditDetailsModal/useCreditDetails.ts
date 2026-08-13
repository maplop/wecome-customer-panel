"use client";
import { useCallback, useEffect, useState } from "react";
import type {
  AmortizacionRow,
  ClientRequestData,
  ClientRequestRecord,
} from "@/types/client-request";
import { formatPaymentFrequency } from "@/utils/formatters";
import { updateRequest } from "@/services/client-requests";
import { calculateScore } from "@/services/onboarding/evaluate-score";
import type { EvaluateScoreResponse } from "@/types/score";
import confetti from "canvas-confetti";
import { Shield, ShieldCheck } from "@/lib/icons";
import {
  calculateCreditBreakdown,
  type CreditBreakdownInput,
} from "@/utils/calculateCreditBreakdown";
import { useClientRequestStore, useCreditDetailsStore } from "@/stores";

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
        seguro_vida: endpointData.seguro_vida_al_millar ?? 0,
        seguro_invalidez_total_permanente:
          endpointData.seguro_invalidez_al_millar ?? 0,
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
  const [isRejecting, setIsRejecting] = useState(false);
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

  // Actualiza la solicitud EXACTA que se está viendo en el modal (no la
  // "activa" del store, que podría ser otra), para que el item del dashboard
  // cambie su estado al momento.
  const updateThisRequest = useCallback(
    async (patch: Partial<ClientRequestData>) => {
      const updated = await updateRequest({
        id: credit.id,
        form_id: credit.form_id,
        client: credit.client,
        enabled: Number(credit.enabled || 1),
        data: { ...data, ...patch },
      });

      if (updated) {
        useClientRequestStore.getState().upsertRequest(updated);
      }

      return updated;
    },
    [credit.id, credit.form_id, credit.client, credit.enabled, data],
  );

  const handleAccept = async () => {
    setIsUpdating(true);
    setError("");
    try {
      await updateThisRequest({
        estado: "approved",
        monto_ofertado: montoOfertado,
        frecuencia_de_pago_ofertada:
          data.frecuencia_de_pago_ofertada ??
          data.frecuencia_de_pago_solicitada,
        plazo_ofertado: data.plazo_ofertado ?? data.plazo_solicitado,
        tipo_de_credito_ofertado:
          data.tipo_de_credito_ofertado ?? data.tipo_de_credito_solicitado,
        ...(scoreData
          ? {
              perfil: scoreData.perfil,
              historial_crediticio_usado:
                scoreData.historial_crediticio_usado ?? "",
              probabilidad_rotacion_promedio: String(
                scoreData.probabilidad_rotacion_promedio,
              ),
              capacidad_endeudamiento_max:
                scoreData.capacidad_endeudamiento_max,
              comision_apertura: scoreData.comision_apertura,
              monto_total_a_pagar: scoreData.monto_total_a_pagar,
              evaluation_id: scoreData.evaluation_id ?? evaluationId,
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

  // Rechaza la oferta del crédito: marca la solicitud como denegada.
  // Devuelve true si se rechazó correctamente para que el modal pueda cerrarse.
  const handleReject = async (): Promise<boolean> => {
    setIsRejecting(true);
    setError("");
    try {
      await updateThisRequest({ estado: "denied" });
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo rechazar la solicitud.",
      );
      return false;
    } finally {
      setIsRejecting(false);
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
    isRejecting,
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
    handleReject,
  };
};
