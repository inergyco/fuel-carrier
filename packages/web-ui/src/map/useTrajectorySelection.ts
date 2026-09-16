import { useState } from 'react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import {
  canRequestTrajectory,
  toHistoryRequest,
  type TrajectoryHistoryRequest,
} from './trajectory-utils'

export function useTrajectorySelection() {
  const [isPlanningRoute, setIsPlanningRoute] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState('')
  const [startAt, setStartAt] = useState<Date | null>(null)
  const [endAt, setEndAt] = useState<Date | null>(null)
  const [historyRequest, setHistoryRequest] =
    useState<TrajectoryHistoryRequest | null>(null)

  const isHistoryMode = historyRequest != null
  const hasSelectedCar = selectedCarId.length > 0
  const canSubmit = canRequestTrajectory({
    carId: selectedCarId,
    start: startAt,
    end: endAt,
  })

  function resetForm() {
    setIsPlanningRoute(false)
    setSelectedCarId('')
    setStartAt(null)
    setEndAt(null)
    setHistoryRequest(null)
  }

  function handleStartPlanning() {
    if (isHistoryMode) {
      return
    }

    setIsPlanningRoute(true)
    setSelectedCarId('')
    setStartAt(null)
    setEndAt(null)
    setHistoryRequest(null)
  }

  function handleSelectMarker(marker: CarTelemetryMarker) {
    if (isHistoryMode) {
      return
    }

    setIsPlanningRoute(true)
    setSelectedCarId(marker.carId)
    setStartAt(null)
    setEndAt(null)
    setHistoryRequest(null)
  }

  function handleShowTrajectory() {
    if (!canSubmit || startAt == null || endAt == null) {
      return
    }

    setHistoryRequest(
      toHistoryRequest({
        carId: selectedCarId,
        start: startAt,
        end: endAt,
      }),
    )
  }

  function handleBackToLiveMap() {
    resetForm()
  }

  function handleClearSelection() {
    setSelectedCarId('')
    setStartAt(null)
    setEndAt(null)
    setHistoryRequest(null)
  }

  return {
    selectedCarId,
    startAt,
    endAt,
    historyRequest,
    isHistoryMode,
    isPlanningRoute,
    hasSelectedCar,
    canSubmit,
    setStartAt,
    setEndAt,
    handleStartPlanning,
    handleSelectMarker,
    handleClearSelection,
    handleShowTrajectory,
    handleBackToLiveMap,
  }
}
