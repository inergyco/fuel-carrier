import { useState } from 'react'
import type { Car, CarMqttCredentials } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { provisionCarMqttCredentials } from '../../lib/api/cars'

export function useCarMqttCredentials() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [mqttTarget, setMqttTarget] = useState<Car | null>(null)
  const [mqttCredentials, setMqttCredentials] =
    useState<CarMqttCredentials | null>(null)

  const mqttMutation = useMutation({
    mutationFn: provisionCarMqttCredentials,
    onSuccess: function onMqttCredentialsProvisioned(result) {
      setMqttCredentials(result)
      toast.success(
        result.rotated
          ? LL.externalPanel.toast.carMqttCredentialsRotated()
          : LL.externalPanel.toast.carMqttCredentialsProvisioned(),
      )
    },
    onError: function onMqttCredentialsError() {
      toast.error(LL.externalPanel.cars.mqttCredentialsFailed())
    },
  })

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
    mqttTarget,
    mqttCredentials,
    mqttMutation,
    openMqttCredentials,
    closeMqttConfirm,
    closeMqttCredentials,
  }
}
