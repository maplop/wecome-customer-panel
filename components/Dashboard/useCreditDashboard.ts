"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useClientDataStore } from "@/stores/client-data-store";
import { useClientRequestStore, useCreditDetailsStore } from "@/stores";
import type {
  RequestStatus,
  ClientRequestRecord,
} from "@/types/client-request";
import { getRequestsByClient } from "@/services/client-requests";
import { updateClientData } from "@/services/client-data";

export type TabFilter = RequestStatus | "all";

export const TAB_LABELS: Record<TabFilter, string> = {
  all: "Todos",
  pending: "Pendientes",
  resolved: "Resueltos",
  approved: "Aprobados",
  active: "Activos",
  completed: "Finalizados",
  denied: "Denegados",
};

export const TABS = Object.keys(TAB_LABELS) as TabFilter[];

export function useCreditDashboard() {
  const router = useRouter();
  const session = useClientDataStore((state) => state);
  const requests = useClientRequestStore((state) => state.requests);

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false);
  const [createRequestError, setCreateRequestError] = useState("");
  const [refreshRequestsError, setRefreshRequestsError] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [creditDetailsModal, setCreditDetailsModal] = useState<{
    open: boolean;
    credit: ClientRequestRecord | null;
  }>({ open: false, credit: null });
  const [deniedRequestModal, setDeniedRequestModal] = useState<{
    open: boolean;
    credit: ClientRequestRecord | null;
  }>({ open: false, credit: null });

  const user = useMemo(() => {
    const data = session.client?.pii;
    return {
      name: `${data?.name} ${data?.apellido_paterno}`,
      email: data?.email,
    };
  }, [session]);

  const canRequestNewCredit = useMemo(() => {
    if (requests.length === 0) return true;
    return requests.every(
      (r) => r.data.estado === "completed" || r.data.estado === "denied",
    );
  }, [requests]);

  const filteredCredits = requests.filter((r) =>
    activeTab === "all" ? true : r.data.estado === activeTab,
  );

  const handleOpenDetail = (record: ClientRequestRecord) => {
    const estado = record.data.estado ?? "pending";

    if (estado === "resolved" || estado === "approved" || estado === "completed" || estado === "active") {
      setCreditDetailsModal({ open: true, credit: record });
    } else if (estado === "denied") {
      setDeniedRequestModal({ open: true, credit: record });
    }
  };

  const handleCloseCreditDetailsModal = () =>
    setCreditDetailsModal({ open: false, credit: null });

  const handleCloseDeniedRequestModal = () =>
    setDeniedRequestModal({ open: false, credit: null });

  const handleCreateNewRequest = async () => {
    if (isCreatingRequest) return;

    const clientId = Number(session.client?.id ?? 0);
    if (!clientId) {
      setCreateRequestError(
        "No se pudo identificar el cliente para crear una nueva solicitud.",
      );
      return;
    }

    setCreateRequestError("");
    setIsCreatingRequest(true);

    const currentStep = ROUTES.ONBOARDING.TERMS_ACCEPTANCE;

    try {
      // La solicitud NO se crea aquí: se crea en CreditSelection al evaluar
      // el score (useCreditSelection.handleContinue). Aquí limpiamos la
      // solicitud activa (que tras el login apunta a la más reciente del
      // cliente) para que en CreditSelection se haga POST y no PUT sobre una
      // solicitud anterior, y solo navegamos al flujo.
      useClientRequestStore.getState().setActiveRequestId(null);

      await updateClientData({ pii: { paso_actual: currentStep } });

      router.push(currentStep);
    } catch (error) {
      setCreateRequestError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la nueva solicitud. Intenta nuevamente.",
      );
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const handleRefreshRequests = async () => {
    if (isRefreshingRequests) return;

    const clientId = Number(session.client?.id ?? 0);
    if (!clientId) {
      setRefreshRequestsError(
        "No se pudo identificar el cliente para actualizar solicitudes.",
      );
      return;
    }

    setRefreshRequestsError("");
    setIsRefreshingRequests(true);

    try {
      const latestRequests = await getRequestsByClient(String(clientId));
      useClientRequestStore
        .getState()
        .syncClientRequests(clientId, latestRequests);
      useCreditDetailsStore.getState().clearCreditDetails();
    } catch (error) {
      setRefreshRequestsError(
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar las solicitudes. Intenta nuevamente.",
      );
    } finally {
      setIsRefreshingRequests(false);
    }
  };

  return {
    user,
    activeTab,
    setActiveTab,
    filteredCredits,
    canRequestNewCredit,
    isCreatingRequest,
    isRefreshingRequests,
    createRequestError,
    refreshRequestsError,
    creditDetailsModal,
    deniedRequestModal,
    handleOpenDetail,
    handleCloseCreditDetailsModal,
    handleCloseDeniedRequestModal,
    handleCreateNewRequest,
    handleRefreshRequests,
  };
}
