import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { GatewayEnvelope, InfoResponse, ClientInfo } from "@/types/client-data";

function extractPeopleId(info: InfoResponse): number {
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
  const { data: infoResponse } = await apiClient.get<
    GatewayEnvelope<InfoResponse>
  >(SERVICES.USERS_GET_INFO);
  console.log("data---", infoResponse);
  const info = infoResponse?.data ?? {};

  return {
    user: info?.user,
    company: info?.company,
    group: info?.group,
    peopleId: extractPeopleId(info),
  };
}
