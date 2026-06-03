import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { Company, GatewayEnvelope } from "@/types/client-data";

export async function getCompany(
  companyId?: number,
): Promise<Company | null> {
  const { data: companyResponse } = await apiClient.get<
    GatewayEnvelope<Company[] | Company>
  >(SERVICES.COMPANY, {
    params: { id: companyId },
  });

  const companyData = companyResponse?.data;
  return Array.isArray(companyData) ? (companyData[0] ?? null) : (companyData ?? null);
}
