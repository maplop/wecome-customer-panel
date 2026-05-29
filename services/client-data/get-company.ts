import { apiClient, SERVICES } from "@/api/dynamicore/frontend";

interface GatewayEnvelope<T> {
  data?: T;
}

export async function getCompany(
  companyId?: number,
): Promise<Record<string, unknown> | null> {
  const { data: companyResponse } = await apiClient.get<
    GatewayEnvelope<Array<Record<string, unknown>> | Record<string, unknown>>
  >(SERVICES.COMPANY, {
    params: { id: companyId },
  });

  const companyData = companyResponse?.data;
  return Array.isArray(companyData) ? (companyData[0] ?? null) : (companyData ?? null);
}
