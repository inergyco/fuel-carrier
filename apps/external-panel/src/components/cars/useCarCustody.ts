import { useMemo, useState } from 'react'
import type { Car, Driver } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { fetchAllPaginated, isApiClientError } from '@fuel-carrier/web-ui/api'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { carKeys, updateCar } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'

export type CarCustodyMode = 'assign' | 'change' | 'end'

export type CarCustodyTarget = {
  car: Car
  mode: CarCustodyMode
}

export function useCarCustody() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<CarCustodyTarget | null>(null)

  const driversQuery = useQuery({
    queryKey: [...driverKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchDrivers),
  })

  const driverNameById = useMemo(
    () =>
      new Map(
        (driversQuery.data ?? []).map((driver) => [
          driver.id,
          `${driver.firstName} ${driver.lastName}`,
        ]),
      ),
    [driversQuery.data],
  )

  const mutation = useMutation({
    mutationFn: (input: {
      carId: string
      driverId: string | null
      expectedDriverId: string | null
      mode: CarCustodyMode
    }) =>
      updateCar(input.carId, {
        driverId: input.driverId,
        expectedDriverId: input.expectedDriverId,
      }),
    onSuccess: async function onCustodyUpdated(_car, variables) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: carKeys.all }),
        queryClient.invalidateQueries({ queryKey: driverKeys.all }),
      ])
      setTarget(null)

      if (variables.mode === 'assign') {
        toast.success(LL.externalPanel.toast.carDriverAssigned())
        return
      }

      if (variables.mode === 'change') {
        toast.success(LL.externalPanel.toast.carDriverChanged())
        return
      }

      toast.success(LL.externalPanel.toast.carCustodyEnded())
    },
    onError: (error) => {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.CONFLICT
      ) {
        toast.error(LL.externalPanel.cars.custodyConflict())
        return
      }

      toast.error(LL.externalPanel.cars.custodyFailed())
    },
  })

  function openAssign(car: Car) {
    setTarget({ car, mode: 'assign' })
  }

  function openChange(car: Car) {
    setTarget({ car, mode: 'change' })
  }

  function openEnd(car: Car) {
    setTarget({ car, mode: 'end' })
  }

  function close() {
    if (!mutation.isPending) {
      setTarget(null)
    }
  }

  function driverLabel(driver: Driver): string {
    return `${driver.firstName} ${driver.lastName}`
  }

  function currentDriverName(car: Car): string {
    if (!car.driverId) {
      return LL.externalPanel.cars.noDriver()
    }

    return (
      driverNameById.get(car.driverId) ?? LL.externalPanel.cars.noDriver()
    )
  }

  return {
    target,
    drivers: driversQuery.data ?? [],
    driversLoading: driversQuery.isLoading,
    driverNameById,
    currentDriverName,
    driverLabel,
    mutation,
    openAssign,
    openChange,
    openEnd,
    close,
  }
}

export type CarCustodyApi = ReturnType<typeof useCarCustody>
export type CarCustodyPickerMode = Extract<CarCustodyMode, 'assign' | 'change'>
