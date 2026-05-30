import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import {
  ClientData,
  ClientPeopleType,
  GatewayEnvelope,
} from "@/types/client-data";

export interface ClientPeopleResult {
  people: ClientData;
  peopleType: ClientPeopleType;
  peopleTypeId?: number;
}

export async function getPeople(peopleId: number): Promise<ClientPeopleResult> {
  const { data: peopleResponse } = await apiClient.get<
    GatewayEnvelope<ClientData | ClientData[]>
  >(SERVICES.PEOPLE, {
    params: { id: peopleId },
  });
  const peopleData = peopleResponse?.data;
  const people = Array.isArray(peopleData)
    ? (peopleData[0] ?? {})
    : (peopleData ?? {});

  const { data: peopleTypeResponse } = await apiClient.get<
    GatewayEnvelope<ClientPeopleType | ClientPeopleType[]>
  >(SERVICES.PEOPLE_TYPES, {
    params: { id: people?.client_type ?? 0 },
  });
  const peopleTypeData = peopleTypeResponse?.data;
  const peopleType = Array.isArray(peopleTypeData)
    ? (peopleTypeData[0] ?? {})
    : (peopleTypeData ?? {});

  return {
    people,
    peopleType,
    peopleTypeId: peopleType?.id,
  };
}
