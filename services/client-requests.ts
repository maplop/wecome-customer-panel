import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { ApiResponse } from "@/types/api-response";
import {
  AddClientRequestInput,
  ClientRequestData,
  ClientRequestRecord,
  UpdateClientRequestInput,
} from "@/types/client-request";
import { useClientRequestStore } from "@/stores/client-request-store";

function pickRequestRecord(
  data: ClientRequestRecord | ClientRequestRecord[] | null | undefined,
): ClientRequestRecord | null {
  if (!data) return null;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export const getRequestsByClient = async (
  clientId: string,
): Promise<ClientRequestRecord[]> => {
  if (!clientId) return [];

  const { data: response } = await apiClient.get<
    ApiResponse<ClientRequestRecord[]>
  >(SERVICES.NOTIFICATIONS_FORMS_DATA, {
    params: {
      client: Number(clientId),
      enabled: 1,
    },
  });

  return Array.isArray(response?.data) ? response.data : [];
};

export const addRequest = async (
  payload: AddClientRequestInput,
): Promise<ClientRequestRecord | null> => {
  if (!payload?.form_id?.trim()) {
    throw new Error("form_id es requerido.");
  }

  if (!Number.isFinite(payload.client) || payload.client <= 0) {
    throw new Error("client debe ser un numero valido.");
  }

  const { data: response } = await apiClient.post<
    ApiResponse<ClientRequestRecord | ClientRequestRecord[]>
  >(SERVICES.NOTIFICATIONS_FORMS_DATA, {
    form_id: payload.form_id,
    client: payload.client,
    enabled: payload.enabled ?? 1,
    data: payload.data ?? {},
  });

  return pickRequestRecord(response?.data);
};

export const updateRequest = async (
  payload: UpdateClientRequestInput,
): Promise<ClientRequestRecord | null> => {
  if (!payload?.id?.trim()) {
    throw new Error("id es requerido.");
  }

  if (!String(payload.form_id ?? "").trim()) {
    throw new Error("form_id es requerido.");
  }

  if (!Number.isFinite(payload.client) || payload.client <= 0) {
    throw new Error("client debe ser un numero valido.");
  }

  const { data: response } = await apiClient.put<
    ApiResponse<ClientRequestRecord | ClientRequestRecord[]>
  >(SERVICES.NOTIFICATIONS_FORMS_DATA, {
    id: payload.id,
    form_id: String(payload.form_id),
    client: payload.client,
    enabled: payload.enabled ?? 1,
    data: payload.data ?? {},
  });

  return pickRequestRecord(response?.data);
};

interface UpdateActiveRequestDataOptions {
  clientId?: number;
}

export const updateActiveRequestData = async (
  patch: Partial<ClientRequestData>,
  options: UpdateActiveRequestDataOptions = {},
): Promise<ClientRequestRecord | null> => {
  const requestStore = useClientRequestStore.getState();
  let activeRequest = requestStore.getActiveRequest();
  const resolvedClientId = Number(
    options.clientId ?? requestStore.clientId ?? activeRequest?.client ?? 0,
  );

  if ((!activeRequest || requestStore.clientId !== resolvedClientId) && resolvedClientId > 0) {
    const requests = await getRequestsByClient(String(resolvedClientId));
    requestStore.syncClientRequests(resolvedClientId, requests);
    activeRequest = requestStore.getActiveRequest();
  }

  if (!activeRequest?.id) {
    throw new Error("No hay una solicitud activa para actualizar.");
  }

  const updated = await updateRequest({
    id: activeRequest.id,
    form_id: activeRequest.form_id,
    client: activeRequest.client,
    enabled: Number(activeRequest.enabled || 1),
    data: {
      ...(activeRequest.data ?? {}),
      ...patch,
    },
  });

  if (updated) {
    requestStore.upsertRequest(updated);
  }

  return updated;
};
