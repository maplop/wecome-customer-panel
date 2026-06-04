import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { useClientDataStore } from "@/stores/client-data-store";
import { ClientType, ClientPiiType } from "@/types/client-data/client";

interface UpdateClientDataInput {
  pii: Partial<ClientPiiType> & Record<string, unknown>;
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
  const { client } = useClientDataStore.getState();

  if (!client) {
    throw new Error(
      "No se encontró información del cliente en sesión. Asegúrate de haber cargado los datos del cliente antes de actualizar.",
    );
  }

  const step = getCurrentStep(clientData.step);

  const payload = {
    client_type: client.client_type,
    id: client.id,
    group: client.group,
    pii: {
      ...clientData.pii,
      step,
    },
  };

  const { data: response } = await apiClient.put(SERVICES.PEOPLE, payload);

  // Actualizar pii en el store después del PUT
  useClientDataStore.setState({
    client: {
      ...client,
      pii: {
        ...client?.pii,
        ...clientData.pii,
      },
    },
  });

  return response?.data ?? response;
}
