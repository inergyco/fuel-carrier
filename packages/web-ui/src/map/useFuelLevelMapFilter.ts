import { useState } from 'react'
import {
  getTotalTankCapacityLiters,
  type CarTelemetryMarker,
  type FuelLevelFilter,
} from '@fuel-carrier/shared-types'
import { getFuelLevel, type FuelLevel } from './fuel-level'

type UseFuelLevelMapFilterOptions = {
  markers: CarTelemetryMarker[]
  /** Controlled fuel-level filter from the dashboard cars list (excludes `unknown`). */
  fuelLevel?: FuelLevelFilter
  onFuelLevelChange?: (fuelLevel: FuelLevelFilter) => void
}

export function useFuelLevelMapFilter({
  markers,
  fuelLevel = 'all',
  onFuelLevelChange,
}: UseFuelLevelMapFilterOptions) {
  const isControlled = onFuelLevelChange != null
  const [internalLevel, setInternalLevel] = useState<FuelLevel | null>(null)
  /** Map-only override for the `unknown` band when the cars list is controlled. */
  const [unknownOnly, setUnknownOnly] = useState(false)

  const selectedLevel: FuelLevel | null = resolveSelectedLevel({
    isControlled,
    fuelLevel,
    internalLevel,
    unknownOnly,
  })

  const visibleMarkers =
    selectedLevel == null
      ? markers
      : markers.filter((marker) =>
          markerMatchesFuelLevel(marker, selectedLevel),
        )

  function handleSelectLevel(level: FuelLevel) {
    const nextLevel = selectedLevel === level ? null : level

    if (!isControlled) {
      setInternalLevel(nextLevel)
      return
    }

    if (level === 'unknown') {
      setUnknownOnly(nextLevel === 'unknown')
      onFuelLevelChange('all')
      return
    }

    setUnknownOnly(false)
    onFuelLevelChange(selectedLevel === level ? 'all' : level)
  }

  return {
    selectedLevel,
    visibleMarkers,
    handleSelectLevel,
  }
}

const markerMatchesFuelLevel = (
  marker: CarTelemetryMarker,
  selectedLevel: FuelLevel,
) =>
  getFuelLevel(
    marker.remainFuel,
    getTotalTankCapacityLiters(marker.tankCount, marker.tankCapacityLiters),
  ) === selectedLevel

function resolveSelectedLevel(options: {
  isControlled: boolean
  fuelLevel: FuelLevelFilter
  internalLevel: FuelLevel | null
  unknownOnly: boolean
}): FuelLevel | null {
  if (!options.isControlled) {
    return options.internalLevel
  }

  if (options.unknownOnly && options.fuelLevel === 'all') {
    return 'unknown'
  }

  if (options.fuelLevel === 'all') {
    return null
  }

  return options.fuelLevel
}
