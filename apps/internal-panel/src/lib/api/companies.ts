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
import { toResourceListFilterSearchParams } from "@fuel-carrier/web-ui/ui";

export type CompanyListParams = PaginationParams & {
  search?: string;
};

const DEFAULT_LIST_PARAMS: CompanyListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
};

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: CompanyListParams = DEFAULT_LIST_PARAMS) =>
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
  params: CompanyListParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<Company>> {
  return api
    .get("companies", {
      searchParams: {
        page: params.page,
        limit: params.limit,
        ...toResourceListFilterSearchParams({ search: params.search }),
      },
    })
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
