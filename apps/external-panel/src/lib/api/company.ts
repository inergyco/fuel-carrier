import type { Company } from "@fuel-carrier/shared-types";
import { api } from "@fuel-carrier/web-ui/api";

export async function uploadCompanyLogo(file: File): Promise<Company> {
  const body = new FormData();
  body.append("file", file);
  return api.post("company/logo", { body }).json<Company>();
}

export async function removeCompanyLogo(): Promise<Company> {
  return api.delete("company/logo").json<Company>();
}
