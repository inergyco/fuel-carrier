import { useMemo } from 'react';
import type { Car, CarTelemetry, CarTelemetryMarker } from '@fuel-carrier/shared-types';
import {
  toHistoryMarker,
  toPathPoints,
  type TrajectoryHistoryRequest,
} from './trajectory-utils';
import type { PathPoint } from './path-smoothing';
import { useCarTelemetryHistory } from './useCarTelemetryHistory';
import { useTrajectoryPlayback } from './useTrajectoryPlayback';
import type { KyInstance } from '../api';

const EMPTY_HISTORY: CarTelemetry[] = [];
const EMPTY_PATH: PathPoint[] = [];

type UseTrajectoryHistoryOptions = {
  api: KyInstance;
  historyRequest: TrajectoryHistoryRequest | null;
  selectedCar?: Car;
  selectedLiveMarker: CarTelemetryMarker | null;
};

export function useTrajectoryHistory({
  api,
  historyRequest,
  selectedCar,
  selectedLiveMarker,
}: UseTrajectoryHistoryOptions) {
  const historyQuery = useCarTelemetryHistory(api, historyRequest);
  const samples = historyQuery.data ?? EMPTY_HISTORY;
  const pathPoints = useMemo(
    function buildPathPoints() {
      return samples.length === 0 ? EMPTY_PATH : toPathPoints(samples);
    },
    [samples],
  );
  const playback = useTrajectoryPlayback({
    points: pathPoints,
    enabled: pathPoints.length > 0,
  });
  const sample = samples[0];

  return {
    isLoading: historyQuery.isLoading,
    hasHistoryData: samples.length > 0,
    historyPathPoints: pathPoints,
    historyMarker:
      selectedCar && sample
        ? toHistoryMarker({
            car: selectedCar,
            liveMarker: selectedLiveMarker,
            point: {
              ...sample,
              latitude: playback?.latitude ?? sample.latitude,
              longitude: playback?.longitude ?? sample.longitude,
            },
          })
        : null,
  };
}
