import type { CarTelemetry } from '@fuel-carrier/shared-types';
import type { KyInstance } from '../api';
import { useQuery } from '../query';

export const carTelemetryHistoryKeys = {
  all: ['car-telemetry-history'] as const,
  range: (filters: CarTelemetryHistoryFilters) =>
    [
      ...carTelemetryHistoryKeys.all,
      filters.carId,
      filters.start,
      filters.end,
    ] as const,
};

export type CarTelemetryHistoryFilters = {
  carId: string;
  start: string;
  end: string;
};

export function fetchCarTelemetryHistory(
  api: KyInstance,
  filters: CarTelemetryHistoryFilters,
): Promise<CarTelemetry[]> {
  return api
    .get('car-telemetry/history', {
      searchParams: {
        carId: filters.carId,
        start: filters.start,
        end: filters.end,
      },
    })
    .json<CarTelemetry[]>();
}

export function useCarTelemetryHistory(
  api: KyInstance,
  filters: CarTelemetryHistoryFilters | null,
) {
  return useQuery({
    queryKey: filters
      ? carTelemetryHistoryKeys.range(filters)
      : [...carTelemetryHistoryKeys.all, 'idle'],
    queryFn: function loadCarTelemetryHistory() {
      if (filters == null) {
        return Promise.resolve([]);
      }

      return fetchCarTelemetryHistory(api, filters);
    },
    enabled: filters != null,
  });
}
