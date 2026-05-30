import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { useClientDataStore } from "@/stores/client-data-store";
import { ClientPii, GatewayEnvelope } from "@/types/client-data";

interface UpdateClientDataInput {
  pii: Partial<ClientPii> & Record<string, unknown>;
  step?: string;
}

function getCurrentStep(step?: string): string {
  if (step) return step;
  if (typeof window !== "undefined") return window.location.pathname;
  return "unknown";
}

export async function updateClientData(
  clientData: UpdateClientDataInput,
): Promise<unknown> {
  const { people } = useClientDataStore.getState();

  const peopleId = people?.id;
  const groupId = people?.group;
  const clientType = people?.client_type;

  if (!peopleId || !groupId) {
    throw new Error(
      "No se encontró id/group en sesión. Ejecuta getClientData antes de actualizar el cliente.",
    );
  }

  if (!clientType) {
    throw new Error(
      "No se encontró client_type en sesión. Carga people en getClientData.",
    );
  }

  const step = getCurrentStep(clientData.step);

  const payload = {
    client_type: clientType,
    id: peopleId,
    group: groupId,
    pii: {
      ...clientData.pii,
      step,
    },
  };

  const { data: response } = await apiClient.put<GatewayEnvelope<unknown>>(
    SERVICES.PEOPLE,
    payload,
  );

  // Actualizar pii en el store después del PUT
  useClientDataStore.setState({
    people: {
      ...people,
      pii: {
        ...people?.pii,
        ...clientData.pii,
      },
    },
  });

  return response?.data ?? response;
}
