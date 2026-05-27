import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { isApiClientError } from "@/api/core";
import { setUserInfoSession } from "@/lib/user-session";

const MAX_RETRIES = 10;

interface InfoStatement {
  Resource?: string;
}

interface InfoResponse {
  user?: number | string;
  company?: number;
  group?: number;
  json_rol?: {
    Statement?: InfoStatement[];
  };
}

interface GatewayEnvelope<T> {
  code?: number;
  data?: T;
  message?: string;
  object?: string;
  status?: string;
}

interface UserInfo {
  id: number | string | undefined;
  data?: Record<string, unknown>;
  entities: {
    accountIds: number[];
    companyId: number | undefined;
    groupId: number | undefined;
    peopleId: number;
    peopleTypeId?: number;
  };
}

function hasDataRequests(
  args: Array<string | Record<string, unknown>>,
): boolean {
  return args.length > 0;
}

export async function getUserInfo(
  ...args: Array<string | Record<string, unknown>>
): Promise<UserInfo> {
  let retries = 0;
  let user: UserInfo | null = null;
  const completedRequests: Record<string, boolean> = {};
  const options =
    args.find((arg) => arg && typeof arg === "object" && !Array.isArray(arg)) ||
    {};

  while (retries < MAX_RETRIES) {
    try {
      if (!user) {
        const { data: infoResponse } = await apiClient.get<
          GatewayEnvelope<InfoResponse>
        >(
          SERVICES.USERS_GET_INFO,
        );
        const info = infoResponse?.data ?? {};

        const key = `dcore:${info?.company}:client:`;
        const peopleResource = String(
          (info?.json_rol?.Statement ?? []).find((item) =>
            String(item?.Resource || "").startsWith(key),
          )?.Resource ?? "",
        );
        const peopleId = Number.parseInt(peopleResource.replace(key, ""), 10);

        user = {
          id: info?.user,
          data: hasDataRequests(args) ? {} : undefined,
          entities: {
            accountIds: [],
            companyId: info?.company,
            groupId: info?.group,
            peopleId: Number.isFinite(peopleId) ? peopleId : 0,
          },
        };
      }

      console.log("user-info", user);

      console.log("company --", user?.entities?.companyId);

      if (args.includes("company") && !completedRequests.company) {
        user.data = user.data || {};
        const { data: companyResponse } = await apiClient.get<
          GatewayEnvelope<Array<Record<string, unknown>> | Record<string, unknown>>
        >(SERVICES.COMPANY, {
          params: { id: user?.entities?.companyId },
        });
        const companyData = companyResponse?.data;
        user.data.company = Array.isArray(companyData)
          ? (companyData[0] ?? null)
          : (companyData ?? null);
        completedRequests.company = true;
      }

      if (args.includes("people") && !completedRequests.people) {
        user.data = user.data || {};
        const { data: peopleResponse } = await apiClient.get<
          GatewayEnvelope<{ client_type?: number } | Array<{ client_type?: number }>>
        >(SERVICES.PEOPLE, {
          params: { id: user?.entities?.peopleId },
        });
        const peopleData = peopleResponse?.data;
        const people = Array.isArray(peopleData)
          ? (peopleData[0] ?? {})
          : (peopleData ?? {});
        user.data.people = people;

        const { data: peopleTypeResponse } = await apiClient.get<
          GatewayEnvelope<{ id?: number } | Array<{ id?: number }>>
        >(SERVICES.PEOPLE_TYPES, {
          params: { id: people?.client_type ?? 0 },
        });
        const peopleTypeData = peopleTypeResponse?.data;
        const peopleType = Array.isArray(peopleTypeData)
          ? (peopleTypeData[0] ?? {})
          : (peopleTypeData ?? {});
        user.data.peopleType = peopleType;
        user.entities.peopleTypeId = peopleType?.id;
        completedRequests.people = true;
      }

      if (
        args.includes("legal_representative_document_upload") &&
        !completedRequests.legal_representative_document_upload
      ) {
        user.data = user.data || {};
        const relationshipId = Number(
          (options as { relationship_id?: unknown })?.relationship_id,
        );
        const relationshipFilter =
          Number.isFinite(relationshipId) && relationshipId > 0
            ? { relationship_id: relationshipId }
            : {};

        const { data: legalRepresentativeResp } = await apiClient.get<
          GatewayEnvelope<{ values?: Array<Record<string, unknown>> }>
        >(SERVICES.PEOPLE_ORGANIZATIONAL_OLD, {
          params: { borrower: user?.entities?.peopleId },
        });

        const { data: relatedPeopleResp } = await apiClient.get<
          GatewayEnvelope<{ values?: Array<Record<string, unknown>> }>
        >(SERVICES.PEOPLE_ORGANIZATIONAL, {
          params: {
            borrower: user?.entities?.peopleId,
            limit: 1000,
            page: 1,
            ...relationshipFilter,
          },
        });

        const legalRepresentativeDocumentUpload =
          legalRepresentativeResp?.data?.values ?? [];
        const relatedPeople = relatedPeopleResp?.data?.values ?? [];

        const filtered = Object.keys(relationshipFilter).length
          ? legalRepresentativeDocumentUpload.filter(
              (item) => Number(item?.relationship_id) === relationshipId,
            )
          : legalRepresentativeDocumentUpload;

        const normalized = filtered.map((item) => {
          const itemRecord = { ...item };
          itemRecord.people = relatedPeople.find(
            (relatedItem) => relatedItem.id === itemRecord.person,
          );
          delete itemRecord.person;
          return itemRecord;
        });

        user.data.legal_representative_document_upload = normalized;
        completedRequests.legal_representative_document_upload = true;
      }

      setUserInfoSession(user);
      return user;
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
          "No se pudo obtener toda la informacion del usuario despues de varios intentos.",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("No se pudo obtener la informacion del usuario.");
}
