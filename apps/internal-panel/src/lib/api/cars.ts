import type {
  Car,
  CarMqttCredentials,
  PaginatedResult,
  ResourceListParams,
} from "@fuel-carrier/shared-types";
import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import type {
  CreateInternalCarDto,
  UpdateInternalCarDto,
} from "@fuel-carrier/shared-validation/car/create";
import { api, fetchAllPaginated } from "@fuel-carrier/web-ui/api";
import { toResourceListFilterSearchParams } from "@fuel-carrier/web-ui/ui";

const DEFAULT_LIST_PARAMS: ResourceListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  assignment: "all",
};

export const carKeys = {
  all: ["cars"] as const,
  byCompany: (
    companyId: string,
    params: ResourceListParams = DEFAULT_LIST_PARAMS,
  ) => ["cars", companyId, params] as const,
  detail: (id: string) => ["cars", id] as const,
};

export type CarFormValues = {
  name: string;
  licensePlate: string;
  note: string;
  driverId: string;
};

export type FetchCarsParams = ResourceListParams & {
  companyId?: string;
};

export function carToFormValues(car?: Car): CarFormValues {
  return {
    name: car?.name ?? "",
    licensePlate: car?.licensePlate ?? "",
    note: car?.note ?? "",
    driverId: car?.driverId ?? "",
  };
}

export async function fetchCars(
  params: FetchCarsParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<Car>> {
  const { companyId, page, limit } = params;
  return api
    .get("cars", {
      searchParams: {
        page,
        limit,
        ...(typeof companyId === "string" ? { companyId } : {}),
        ...toResourceListFilterSearchParams(params),
      },
    })
    .json<PaginatedResult<Car>>();
}

export async function fetchAllCars(companyId?: string): Promise<Car[]> {
  return fetchAllPaginated((pagination) =>
    fetchCars({
      ...pagination,
      assignment: "all",
      ...(typeof companyId === "string" ? { companyId } : {}),
    }),
  );
}

export async function fetchCar(id: string): Promise<Car> {
  return api.get(`cars/${id}`).json<Car>();
}

export async function createCar(dto: CreateInternalCarDto): Promise<Car> {
  return api.post("cars", { json: dto }).json<Car>();
}

export async function updateCar(
  id: string,
  dto: UpdateInternalCarDto,
): Promise<Car> {
  return api.patch(`cars/${id}`, { json: dto }).json<Car>();
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`cars/${id}`).json();
}

export async function provisionCarMqttCredentials(
  id: string,
): Promise<CarMqttCredentials> {
  return api.post(`cars/${id}/mqtt-credentials`).json<CarMqttCredentials>();
}
