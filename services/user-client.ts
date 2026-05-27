import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { getUserInfoSession, setUserInfoSession } from "@/lib/user-session";

interface UserSessionShape {
  data?: {
    people?: {
      id?: number;
      client_type?: number;
      pii?: Record<string, unknown>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  entities?: {
    groupId?: number;
    peopleId?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UpdateCurrentUserClientDataInput {
  pii: Record<string, unknown>;
  step?: string;
}

interface GatewayEnvelope<T> {
  data?: T;
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

export async function updateCurrentUserClientData(
  clientData: UpdateCurrentUserClientDataInput,
): Promise<unknown> {
  const session = getUserInfoSession<UserSessionShape>();
  const peopleId = session?.entities?.peopleId;
  const groupId = session?.entities?.groupId;
  const clientType = session?.data?.people?.client_type;

  if (!peopleId || !groupId) {
    throw new Error(
      "No se encontro peopleId/groupId en sesion. Ejecuta getUserInfo antes de actualizar el cliente.",
    );
  }

  if (!clientType) {
    throw new Error(
      "No se encontro client_type en sesion. Envia client_type o carga people en getUserInfo.",
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

  const nextSession: UserSessionShape = {
    ...(session || {}),
    data: {
      ...(session?.data || {}),
      people: {
        ...(session?.data?.people || {}),
        id: peopleId,
        client_type: clientType,
        pii: payload.pii,
      },
    },
  };
  setUserInfoSession(nextSession);

  return response?.data ?? response;
}
