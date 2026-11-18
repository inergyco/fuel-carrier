import { useState } from 'react'
import type {
  CarOutputAction,
  CarOutputCommandResult,
} from '@fuel-carrier/shared-types'
import { CarOutputActions } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { api, isApiClientError } from '../api'
import { useMutation } from '../query'
import { useToast } from '../ui'

async function sendCarOutputCommand(options: {
  carId: string
  action: CarOutputAction
}): Promise<CarOutputCommandResult> {
  return api
    .post(`cars/${options.carId}/outputs`, {
      json: { action: options.action },
      timeout: 35_000,
    })
    .json<CarOutputCommandResult>()
}

/** Shared truck-output toggle for car detail pages (defaults to active). */
export function useCarOutputCommand() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [active, setActive] = useState(true)

  const mutation = useMutation({
    mutationFn: sendCarOutputCommand,
    onSuccess: function onOutputCommandSuccess(result) {
      setActive(result.action === CarOutputActions.ENABLE)
      toast.success(
        result.action === CarOutputActions.ENABLE
          ? LL.common.carOutput.enabledToast()
          : LL.common.carOutput.disabledToast(),
      )
    },
    onError: function onOutputCommandError(error) {
      toast.error(localizeCarOutputError(error, LL.common.carOutput))
    },
  })

  function toggle(carId: string) {
    mutation.mutate({
      carId,
      action: active ? CarOutputActions.DISABLE : CarOutputActions.ENABLE,
    })
  }

  return {
    active,
    toggle,
    isPending: mutation.isPending,
  }
}

function localizeCarOutputError(
  error: unknown,
  labels: {
    firmwareIdentityRequired: () => string
    failed: () => string
  },
): string {
  if (!isApiClientError(error)) {
    return labels.failed()
  }

  const missingFirmware = error.apiError.fields?.some(
    (field) => field.field === 'firmwareIdentity',
  )
  if (missingFirmware) {
    return labels.firmwareIdentityRequired()
  }

  return labels.failed()
}
