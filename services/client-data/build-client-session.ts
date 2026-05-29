import { ClientSessionData, ClientInfo } from "@/types/client-data";

type ClientDataArgs = Array<string | Record<string, unknown>>;

function hasDataRequests(args: ClientDataArgs): boolean {
  return args.length > 0;
}

export function buildClientSession(
  info: ClientInfo,
  args: ClientDataArgs,
): ClientSessionData {
  return {
    id: info.user,
    data: hasDataRequests(args) ? {} : undefined,
    entities: {
      accountIds: [],
      companyId: info.company,
      groupId: info.group,
      peopleId: info.peopleId,
    },
  };
}
