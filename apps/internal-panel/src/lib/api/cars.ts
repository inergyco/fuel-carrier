import type {
  Car,
  CarMqttCredentials,
  PaginatedResult,
  PaginationParams,
} from "@fuel-carrier/shared-types";
import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import type {
  CreateInternalCarDto,
  UpdateInternalCarDto,
} from "@fuel-carrier/shared-validation/car/create";
import { api, fetchAllPaginated } from "@fuel-carrier/web-ui/api";

export const carKeys = {
  all: ["cars"] as const,
  byCompany: (
    companyId: string,
    params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
  ) => ["cars", companyId, params] as const,
  detail: (id: string) => ["cars", id] as const,
};

export type CarFormValues = {
  name: string;
  licensePlate: string;
  note: string;
  driverId: string;
};

export type FetchCarsParams = PaginationParams & {
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
  params: FetchCarsParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<Car>> {
  const { companyId, page, limit } = params;
  return api
    .get("cars", {
      searchParams: {
        page,
        limit,
        ...(typeof companyId === "string" ? { companyId } : {}),
      },
    })
    .json<PaginatedResult<Car>>();
}

export async function fetchAllCars(companyId?: string): Promise<Car[]> {
  return fetchAllPaginated((pagination) =>
    fetchCars({
      ...pagination,
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
