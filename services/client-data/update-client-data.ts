import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { useClientDataStore } from "@/stores/client-data-store";
import { ClientPiiType } from "@/types/client-data/client";

interface UpdateClientDataInput {
  pii: Partial<ClientPiiType> & Record<string, unknown>;
}

export async function updateClientData(
  clientData: UpdateClientDataInput,
): Promise<any> {
  const { client } = useClientDataStore.getState();

  if (!client) {
    throw new Error(
      "No se encontró información del cliente en sesión. Asegúrate de haber cargado los datos del cliente antes de actualizar.",
    );
  }

  const payload = {
    client_type: client.client_type,
    id: client.id,
    group: client.group,
    pii: {
      ...clientData.pii,
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
