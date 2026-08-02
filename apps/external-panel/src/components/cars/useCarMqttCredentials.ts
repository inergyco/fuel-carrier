import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { provisionCarMqttCredentials } from '../../lib/api/cars'

export function useCarMqttCredentials() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [mqttTarget, setMqttTarget] = useState<Car | null>(null)

  const mqttMutation = useMutation({
    mutationFn: provisionCarMqttCredentials,
    onSuccess: function onMqttCredentialsProvisioned(result) {
      setMqttTarget(null)
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
    setMqttTarget(car)
  }

  function closeMqttConfirm() {
    setMqttTarget(null)
  }

  function closeMqttCredentials() {
    mqttMutation.reset()
  }

  return {
    mqttTarget,
    mqttMutation,
    openMqttCredentials,
    closeMqttConfirm,
    closeMqttCredentials,
  }
}
