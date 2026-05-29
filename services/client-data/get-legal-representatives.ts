import { apiClient, SERVICES } from "@/api/dynamicore/frontend";

interface GatewayEnvelope<T> {
  data?: T;
}

function buildRelationshipFilter(options: Record<string, unknown>): {
  relationshipFilter: Record<string, unknown>;
  relationshipId: number;
} {
  const relationshipId = Number(options?.relationship_id);
  const relationshipFilter =
    Number.isFinite(relationshipId) && relationshipId > 0
      ? { relationship_id: relationshipId }
      : {};

  return { relationshipFilter, relationshipId };
}

export async function getLegalRepresentatives(
  peopleId: number,
  options: Record<string, unknown> = {},
): Promise<Array<Record<string, unknown>>> {
  const { relationshipFilter, relationshipId } = buildRelationshipFilter(options);

  const { data: legalRepresentativeResp } = await apiClient.get<
    GatewayEnvelope<{ values?: Array<Record<string, unknown>> }>
  >(SERVICES.PEOPLE_ORGANIZATIONAL_OLD, {
    params: { borrower: peopleId },
  });

  const { data: relatedPeopleResp } = await apiClient.get<
    GatewayEnvelope<{ values?: Array<Record<string, unknown>> }>
  >(SERVICES.PEOPLE_ORGANIZATIONAL, {
    params: {
      borrower: peopleId,
      limit: 1000,
      page: 1,
      ...relationshipFilter,
    },
  });

  const legalRepresentativeDocumentUpload = legalRepresentativeResp?.data?.values ?? [];
  const relatedPeople = relatedPeopleResp?.data?.values ?? [];

  const filtered = Object.keys(relationshipFilter).length
    ? legalRepresentativeDocumentUpload.filter(
        (item) => Number(item?.relationship_id) === relationshipId,
      )
    : legalRepresentativeDocumentUpload;

  return filtered.map((item) => {
    const itemRecord = { ...item };
    itemRecord.people = relatedPeople.find(
      (relatedItem) => relatedItem.id === itemRecord.person,
    );
    delete itemRecord.person;
    return itemRecord;
  });
}
