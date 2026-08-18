import { useState } from 'react';
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import {
  canRequestTrajectory,
  toHistoryRequest,
  type TrajectoryHistoryRequest,
} from './trajectory-utils';

export function useTrajectorySelection() {
  const [selectedCarId, setSelectedCarId] = useState('');
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [historyRequest, setHistoryRequest] =
    useState<TrajectoryHistoryRequest | null>(null);

  const isHistoryMode = historyRequest != null;
  const hasSelectedCar = selectedCarId.length > 0;
  const canSubmit = canRequestTrajectory({
    carId: selectedCarId,
    start: startAt,
    end: endAt,
  });

  function resetForm() {
    setSelectedCarId('');
    setStartAt(null);
    setEndAt(null);
    setHistoryRequest(null);
  }

  function handleSelectMarker(marker: CarTelemetryMarker) {
    if (isHistoryMode) {
      return;
    }

    setSelectedCarId(marker.carId);
    setStartAt(null);
    setEndAt(null);
    setHistoryRequest(null);
  }

  function handleShowTrajectory() {
    if (!canSubmit || startAt == null || endAt == null) {
      return;
    }

    setHistoryRequest(
      toHistoryRequest({
        carId: selectedCarId,
        start: startAt,
        end: endAt,
      }),
    );
  }

  function handleBackToLiveMap() {
    resetForm();
  }

  return {
    selectedCarId,
    startAt,
    endAt,
    historyRequest,
    isHistoryMode,
    hasSelectedCar,
    canSubmit,
    setStartAt,
    setEndAt,
    handleSelectMarker,
    handleClearSelection: resetForm,
    handleShowTrajectory,
    handleBackToLiveMap,
  };
}
