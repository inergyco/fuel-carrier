import type {
  Company,
  CompanyDeletionImpact,
  PaginatedResult,
  PaginationParams,
} from "@fuel-carrier/shared-types";
import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import type { CreateCompanyDto } from "@fuel-carrier/shared-validation/company/create";
import type { UpdateCompanyDto } from "@fuel-carrier/shared-validation/company/update";
import { api } from "@fuel-carrier/web-ui/api";

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT }) =>
    ["companies", "list", params] as const,
  detail: (id: string) => ["companies", id] as const,
  deletionImpact: (id: string) =>
    ["companies", id, "deletion-impact"] as const,
};

export type CompanyFormValues = {
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  note: string;
  logoUrl: string;
};

export function companyToFormValues(company?: Company): CompanyFormValues {
  return {
    name: company?.name ?? "",
    nationalId: company?.nationalId ?? "",
    phoneNumber: company?.phoneNumber ?? "",
    address: company?.address ?? "",
    note: company?.note ?? "",
    logoUrl: company?.logoUrl ?? "",
  };
}

export async function fetchCompanies(
  params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<Company>> {
  return api
    .get("companies", { searchParams: params })
    .json<PaginatedResult<Company>>();
}

export async function fetchCompany(id: string): Promise<Company> {
  return api.get(`companies/${id}`).json<Company>();
}

export async function fetchCompanyDeletionImpact(
  id: string,
): Promise<CompanyDeletionImpact> {
  return api
    .get(`companies/${id}/deletion-impact`)
    .json<CompanyDeletionImpact>();
}

export async function createCompany(dto: CreateCompanyDto): Promise<Company> {
  return api.post("companies", { json: dto }).json<Company>();
}

export async function updateCompany(
  id: string,
  dto: UpdateCompanyDto,
): Promise<Company> {
  return api.patch(`companies/${id}`, { json: dto }).json<Company>();
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`companies/${id}`).json();
}
