import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { ApiResponse } from "@/types/client-data/api-response";
import { ClientType } from "@/types/client-data/client";
import { ClientPeopleType } from "@/types/client-data/client-type";
export interface ClientPeopleResult {
  people: ClientType;
  peopleType: ClientPeopleType;
  peopleTypeId?: number;
}

export async function getPeople(peopleId: number): Promise<ClientPeopleResult> {
  const { data: peopleResponse } = await apiClient.get<
    ApiResponse<ClientType | ClientType[]>
  >(SERVICES.PEOPLE, {
    params: { id: peopleId },
  });
  const peopleData = peopleResponse?.data;
  const people = Array.isArray(peopleData)
    ? (peopleData[0] ?? {})
    : (peopleData ?? {});

  const { data: peopleTypeResponse } = await apiClient.get<
    ApiResponse<ClientPeopleType | ClientPeopleType[]>
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
