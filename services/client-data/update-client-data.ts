import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { useClientDataStore } from "@/stores/client-data-store";
import { ClientPiiType } from "@/types/client-data/client";
import { AxiosProgressEvent } from "axios";

interface UpdateClientDataInput {
  pii: Partial<ClientPiiType> & Record<string, unknown>;
}

interface UpdateClientDataOptions {
  onProgress?: (progress: number) => void;
}

export async function updateClientData(
  clientData: UpdateClientDataInput,
  options: UpdateClientDataOptions = {},
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

  const { data: response } = await apiClient.put(SERVICES.PEOPLE, payload, {
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!options.onProgress || !event.total) return;
      const progress = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );
      options.onProgress(progress);
    },
  });

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
