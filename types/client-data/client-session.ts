// types/client-data/client-session.types.ts
import { CompanyType } from "@/types/client-data/company";
import { ClientPeopleType } from "@/types/client-data/client-type";
import { ClientType } from "@/types/client-data/client";

export interface ClientInfo {
  user: number;
  company: number;
  group: number;
  peopleId: number;
}

export interface ClientSessionEntities {
  accountIds: number[];
  companyId: number;
  groupId: number;
  peopleId: number;
  peopleTypeId?: number;
}

export interface ClientSessionType {
  id: number;
  entities: ClientSessionEntities;
  data?: {
    company?: CompanyType;
    people?: ClientType;
    peopleType?: ClientPeopleType;
    legal_representative_document_upload?: unknown;
  };
}
