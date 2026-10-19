import type { Company } from "@fuel-carrier/shared-types";
import type { UpdateCompanyPricingDto } from "@fuel-carrier/shared-validation/company/pricing";
import { api } from "@fuel-carrier/web-ui/api";

export const companyKeys = {
  all: ["company"] as const,
  detail: ["company", "detail"] as const,
};

export async function fetchCompany(): Promise<Company> {
  return api.get("company").json<Company>();
}

export async function updateCompanyPricing(
  dto: UpdateCompanyPricingDto,
): Promise<Company> {
  return api.patch("company", { json: dto }).json<Company>();
}

export async function uploadCompanyLogo(file: File): Promise<Company> {
  const body = new FormData();
  body.append("file", file);
  return api.post("company/logo", { body }).json<Company>();
}

export async function removeCompanyLogo(): Promise<Company> {
  return api.delete("company/logo").json<Company>();
}
