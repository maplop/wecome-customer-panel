import { isApiClientError } from "@/api/core";
import { buildClientSession } from "./build-client-session";
import { ClientSessionType } from "@/types/client-data/client-session";
import { getClientInfo } from "./get-client-info";
import { getCompany } from "./get-company";
import { getPeople } from "./get-people";

const MAX_RETRIES = 10;

type ClientDataArgs = Array<string | Record<string, unknown>>;

export async function getClientData(
  ...args: ClientDataArgs
): Promise<ClientSessionType> {
  let retries = 0;
  let clientData: ClientSessionType | null = null;
  const completedRequests: Record<string, boolean> = {};

  while (retries < MAX_RETRIES) {
    try {
      if (!clientData) {
        const info = await getClientInfo();
        clientData = buildClientSession(info, args);
      }
      if (!clientData) {
        throw new Error("No se pudo inicializar la sesion del cliente.");
      }

      if (args.includes("company") && !completedRequests.company) {
        const sessionData = (clientData.data ??= {});
        sessionData.company =
          (await getCompany(clientData.entities.companyId)) ?? undefined;
        completedRequests.company = true;
      }

      if (args.includes("people") && !completedRequests.people) {
        const sessionData = (clientData.data ??= {});
        const peopleData = await getPeople(clientData.entities.peopleId);
        sessionData.people = peopleData.people;
        sessionData.peopleType = peopleData.peopleType;
        clientData.entities.peopleTypeId = peopleData.peopleTypeId;
        completedRequests.people = true;
      }

      return clientData;
    } catch (error: unknown) {
      if (
        isApiClientError(error) &&
        (error.status === 401 || error.status === 403)
      ) {
        throw error;
      }

      retries += 1;

      if (retries === MAX_RETRIES) {
        throw new Error(
          "No se pudo obtener toda la informacion del cliente despues de varios intentos.",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("No se pudo obtener la informacion del cliente.");
}
