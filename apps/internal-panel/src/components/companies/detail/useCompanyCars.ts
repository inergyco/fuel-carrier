import { useMemo, useState } from 'react'
import type { Car, CarMqttCredentials, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { usePagination, useToast } from '@fuel-carrier/web-ui/ui'
import {
  carKeys,
  deleteCar,
  fetchCars,
  provisionCarMqttCredentials,
} from '../../../lib/api/cars'
import { driverKeys, fetchAllDrivers } from '../../../lib/api/drivers'
import type { EntityModalState } from './entity-modal-state'

const EMPTY_CARS: Car[] = []
const EMPTY_DRIVERS: Driver[] = []

export function useCompanyCars(companyId: string) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { pagination, handlePageChange, handleLimitChange } = usePagination()
  const [carModal, setCarModal] = useState<EntityModalState<Car>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)
  const [mqttTarget, setMqttTarget] = useState<Car | null>(null)
  const [mqttCredentials, setMqttCredentials] =
    useState<CarMqttCredentials | null>(null)

  const carsQuery = useQuery({
    queryKey: carKeys.byCompany(companyId, pagination),
    queryFn: () => fetchCars({ companyId, ...pagination }),
    placeholderData: (previous) => previous,
  })

  const driversQuery = useQuery({
    queryKey: [...driverKeys.byCompany(companyId), 'all'] as const,
    queryFn: () => fetchAllDrivers(companyId),
  })

  const companyDrivers = driversQuery.data ?? EMPTY_DRIVERS
  const companyCars = carsQuery.data?.items ?? EMPTY_CARS

  const driverNameById = useMemo(
    function mapDriverNames() {
      const drivers = driversQuery.data ?? EMPTY_DRIVERS
      return new Map(
        drivers.map((driver) => [
          driver.id,
          `${driver.firstName} ${driver.lastName}`,
        ]),
      )
    },
    [driversQuery.data],
  )

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: async function onCarDeleted() {
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      setDeleteTarget(null)
      toast.success(LL.internalPanel.toast.carDeleted())
    },
    onError: function onCarDeleteError() {
      toast.error(LL.internalPanel.companies.detail.deleteFailed())
    },
  })

  const mqttMutation = useMutation({
    mutationFn: provisionCarMqttCredentials,
    onSuccess: function onMqttCredentialsProvisioned(result) {
      setMqttCredentials(result)
      toast.success(
        result.rotated
          ? LL.internalPanel.toast.carMqttCredentialsRotated()
          : LL.internalPanel.toast.carMqttCredentialsProvisioned(),
      )
    },
    onError: function onMqttCredentialsError() {
      toast.error(LL.internalPanel.companies.detail.mqttCredentialsFailed())
    },
  })

  async function handleChanged() {
    await queryClient.invalidateQueries({ queryKey: carKeys.all })
    await queryClient.invalidateQueries({ queryKey: driverKeys.all })
  }

  function openMqttCredentials(car: Car) {
    mqttMutation.reset()
    setMqttCredentials(null)
    setMqttTarget(car)
  }

  function closeMqttConfirm() {
    if (!mqttCredentials) {
      setMqttTarget(null)
    }
  }

  function closeMqttCredentials() {
    mqttMutation.reset()
    setMqttCredentials(null)
    setMqttTarget(null)
  }

  return {
    carsQuery,
    companyDrivers,
    companyCars,
    driverNameById,
    carModal,
    setCarModal,
    deleteTarget,
    setDeleteTarget,
    mqttTarget,
    mqttCredentials,
    openMqttCredentials,
    mqttMutation,
    closeMqttConfirm,
    closeMqttCredentials,
    deleteMutation,
    handleChanged,
    handlePageChange,
    handleLimitChange,
  }
}
