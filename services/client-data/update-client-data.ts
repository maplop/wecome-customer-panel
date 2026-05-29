import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { useClientDataStore } from "@/stores/client-data-store";
import { ClientPii, GatewayEnvelope } from "@/types/client-data";

interface UpdateClientDataInput {
  pii: Partial<ClientPii> & Record<string, unknown>;
  step?: string;
}

function getCurrentStep(step?: string): string {
  if (step) {
    return step;
  }

  if (typeof window !== "undefined") {
    return window.location.pathname;
  }

  return "unknown";
}

export async function updateClientData(
  clientData: UpdateClientDataInput,
): Promise<unknown> {
  const session = useClientDataStore.getState();
  const peopleId = session?.entities?.peopleId;
  const groupId = session?.entities?.groupId;
  const clientType = session?.data?.people?.client_type;

  if (!peopleId || !groupId) {
    throw new Error(
      "No se encontro peopleId/groupId en sesion. Ejecuta getClientData antes de actualizar el cliente.",
    );
  }

  if (!clientType) {
    throw new Error(
      "No se encontro client_type en sesion. Envia client_type o carga people en getClientData.",
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

  if (session.data && session.data.people) {
    const updatedPeople = {
      ...session.data.people,
      pii: {
        ...session.data.people.pii,
        ...clientData.pii,
        step,
      },
    };
    useClientDataStore.setState({
      data: {
        ...session.data,
        people: updatedPeople,
      },
    });
  }

  return response?.data ?? response;
}
