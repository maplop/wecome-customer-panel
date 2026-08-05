import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { UserInfoType } from "@/types/client-data/user-info";
import { ApiResponse } from "@/types/api-response";

type ClientInfo = UserInfoType & {
  peopleId: number;
};

function extractPeopleId(info: UserInfoType): number {
  const key = `dcore:${info?.company}:client:`;
  const peopleResource = String(
    (info?.json_rol?.Statement ?? []).find((item) =>
      String(item?.Resource || "").startsWith(key),
    )?.Resource ?? "",
  );
  const peopleId = Number.parseInt(peopleResource.replace(key, ""), 10);
  return Number.isFinite(peopleId) ? peopleId : 0;
}

export async function getClientInfo(): Promise<ClientInfo> {
  const { data: infoResponse } = await apiClient.get<ApiResponse<UserInfoType>>(
    SERVICES.USERS_GET_INFO,
  );
  console.log("getClientInfo ---", infoResponse);
  const info = infoResponse?.data ?? {};

  return {
    ...info,
    peopleId: extractPeopleId(info),
  };
}
