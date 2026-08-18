import type { Car, CarTelemetry, CarTelemetryMarker } from '@fuel-carrier/shared-types';
import type { PathPoint } from './path-smoothing';
import type { TrajectoryMapViewLabels } from './trajectory-map.types';
import { fleetMapStatusLabel } from './company-legend';

export type TrajectoryTimeRange = {
  carId: string;
  start: Date;
  end: Date;
};

export type TrajectoryHistoryRequest = {
  carId: string;
  start: string;
  end: string;
};

export function canRequestTrajectory({
  carId,
  start,
  end,
}: {
  carId: string;
  start: Date | null;
  end: Date | null;
}): boolean {
  if (!carId || start == null || end == null) {
    return false;
  }

  return start.getTime() <= end.getTime();
}

export function toHistoryRequest(range: TrajectoryTimeRange): TrajectoryHistoryRequest {
  return {
    carId: range.carId,
    start: range.start.toISOString(),
    end: range.end.toISOString(),
  };
}

export function toPathPoints(
  points: readonly CarTelemetry[],
): PathPoint[] {
  return points.map(function toPathPoint(point) {
    return {
      latitude: point.latitude,
      longitude: point.longitude,
    };
  });
}

export function getVehicleLabel({
  car,
  marker,
  fallback,
}: {
  car?: Car;
  marker: CarTelemetryMarker | null;
  fallback: string;
}): string {
  if (car?.name?.trim()) {
    return car.name;
  }

  if (marker?.name?.trim()) {
    return marker.name;
  }

  if (car?.licensePlate) {
    return car.licensePlate;
  }

  if (marker?.licensePlate) {
    return marker.licensePlate;
  }

  return fallback;
}

export function toHistoryMarker({
  car,
  liveMarker,
  point,
}: {
  car: Car;
  liveMarker: CarTelemetryMarker | null;
  point: Pick<CarTelemetry, 'latitude' | 'longitude' | 'updatedAt' | 'speed' | 'remainFuel' | 'fuelAmount' | 'resistance'>;
}): CarTelemetryMarker {
  return {
    carId: car.id,
    name: car.name,
    licensePlate: car.licensePlate,
    companyId: car.companyId,
    companyName: liveMarker?.companyName,
    latitude: point.latitude,
    longitude: point.longitude,
    updatedAt: point.updatedAt,
    speed: point.speed,
    remainFuel: point.remainFuel,
    fuelAmount: point.fuelAmount,
    resistance: point.resistance,
  };
}

export function resolveTrajectoryStatusText({
  labels,
  isHistoryMode,
  isHistoryLoading,
  hasHistoryData,
  vehicleLabel,
  liveMarkerCount,
  isLiveLoading,
  selectedCompanyName,
  hasSelectedCar,
}: {
  labels: TrajectoryMapViewLabels;
  isHistoryMode: boolean;
  isHistoryLoading: boolean;
  hasHistoryData: boolean;
  vehicleLabel: string;
  liveMarkerCount: number;
  isLiveLoading: boolean;
  selectedCompanyName: string | null;
  hasSelectedCar: boolean;
}): string {
  if (isHistoryMode) {
    if (isHistoryLoading) {
      return labels.showTrajectoryLoading();
    }

    if (!hasHistoryData) {
      return labels.noTrajectoryData();
    }

    return labels.selectedTimeRange({ vehicle: vehicleLabel });
  }

  if (hasSelectedCar) {
    return labels.selectedVehiclePrompt({ vehicle: vehicleLabel });
  }

  return fleetMapStatusLabel(
    isLiveLoading,
    liveMarkerCount,
    selectedCompanyName,
    labels,
  );
}
