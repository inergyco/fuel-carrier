import { useMemo, useState } from 'react'
import type { Car, Driver } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { carKeys, updateCar } from '../../../../lib/api/cars'
import { driverKeys, fetchAllDrivers } from '../../../../lib/api/drivers'

export type CarCustodyMode = 'assign' | 'change' | 'end'

export type CarCustodyTarget = {
  car: Car
  mode: CarCustodyMode
}

export function useCompanyCarCustody(companyId: string) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<CarCustodyTarget | null>(null)
  const detail = LL.internalPanel.companies.detail

  const driversQuery = useQuery({
    queryKey: [...driverKeys.byCompany(companyId), 'all'] as const,
    queryFn: () => fetchAllDrivers(companyId),
  })

  const driverNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const driver of driversQuery.data ?? []) {
      map.set(driver.id, `${driver.firstName} ${driver.lastName}`)
    }
    return map
  }, [driversQuery.data])

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
        toast.success(LL.internalPanel.toast.carDriverAssigned())
        return
      }

      if (variables.mode === 'change') {
        toast.success(LL.internalPanel.toast.carDriverChanged())
        return
      }

      toast.success(LL.internalPanel.toast.carCustodyEnded())
    },
    onError: (error) => {
      if (
        isApiClientError(error) &&
        error.apiError.code === ApiErrorCode.CONFLICT
      ) {
        toast.error(detail.custodyConflict())
        return
      }

      toast.error(detail.custodyFailed())
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
      return detail.noDriver()
    }

    return driverNameById.get(car.driverId) ?? detail.noDriver()
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

export type CompanyCarCustodyApi = ReturnType<typeof useCompanyCarCustody>
export type CarCustodyPickerMode = Extract<CarCustodyMode, 'assign' | 'change'>
