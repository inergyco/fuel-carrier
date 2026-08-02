import { useMemo, useState } from 'react'
import type { Car, CarMqttCredentials } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import {
  carKeys,
  deleteCar,
  fetchCars,
  provisionCarMqttCredentials,
} from '../../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../../lib/api/drivers'
import type { EntityModalState } from './entity-modal-state'

export function useCompanyCars(companyId: string) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [carModal, setCarModal] = useState<EntityModalState<Car>>(null)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)
  const [mqttTarget, setMqttTarget] = useState<Car | null>(null)
  const [mqttCredentials, setMqttCredentials] =
    useState<CarMqttCredentials | null>(null)

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
  })

  const companyDrivers = useMemo(
    function filterCompanyDrivers() {
      return (driversQuery.data ?? []).filter(
        (driver) => driver.companyId === companyId,
      )
    },
    [driversQuery.data, companyId],
  )

  const companyCars = useMemo(
    function filterCompanyCars() {
      return (carsQuery.data ?? []).filter((car) => car.companyId === companyId)
    },
    [carsQuery.data, companyId],
  )

  const driverNameById = useMemo(
    function mapDriverNames() {
      return new Map(
        companyDrivers.map((driver) => [
          driver.id,
          `${driver.firstName} ${driver.lastName}`,
        ]),
      )
    },
    [companyDrivers],
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
  }
}
