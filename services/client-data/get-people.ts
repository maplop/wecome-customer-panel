import { apiClient, SERVICES } from "@/api/dynamicore/frontend";

interface GatewayEnvelope<T> {
  data?: T;
}

interface PeoplePayload {
  client_type?: number;
  [key: string]: unknown;
}

interface PeopleTypePayload {
  id?: number;
  [key: string]: unknown;
}

export interface ClientPeopleResult {
  people: PeoplePayload;
  peopleType: PeopleTypePayload;
  peopleTypeId?: number;
}

export async function getPeople(peopleId: number): Promise<ClientPeopleResult> {
  const { data: peopleResponse } = await apiClient.get<
    GatewayEnvelope<PeoplePayload | PeoplePayload[]>
  >(SERVICES.PEOPLE, {
    params: { id: peopleId },
  });
  const peopleData = peopleResponse?.data;
  const people = Array.isArray(peopleData) ? (peopleData[0] ?? {}) : (peopleData ?? {});

  const { data: peopleTypeResponse } = await apiClient.get<
    GatewayEnvelope<PeopleTypePayload | PeopleTypePayload[]>
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
