import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { CompanyType } from "@/types/client-data/company";
import { ApiResponse } from "@/types/api-response";

export async function getCompany(
  companyId?: number,
): Promise<CompanyType | null> {
  const { data: companyResponse } = await apiClient.get<
    ApiResponse<CompanyType[] | CompanyType>
  >(SERVICES.COMPANY, {
    params: { id: companyId },
  });

  const companyData = companyResponse?.data;
  return Array.isArray(companyData)
    ? (companyData[0] ?? null)
    : (companyData ?? null);
}
