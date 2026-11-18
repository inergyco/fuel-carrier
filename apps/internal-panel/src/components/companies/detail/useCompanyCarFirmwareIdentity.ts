import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import type { FirmwareIdentityDraft } from '@fuel-carrier/web-ui/cars'
import { useMutation, useQueryClient } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { CAR_FIRMWARE_ID_MAX_LENGTH } from '@fuel-carrier/shared-validation/car/create'
import { carKeys, updateCar } from '../../../lib/api/cars'

function draftFromCar(car: Car): FirmwareIdentityDraft {
  return {
    firmwareCompanyId: car.firmwareCompanyId?.trim() ?? '',
    firmwareDeviceId: car.firmwareDeviceId?.trim() ?? '',
  }
}

function isDraftDirty(car: Car, draft: FirmwareIdentityDraft): boolean {
  const current = draftFromCar(car)
  return (
    draft.firmwareCompanyId.trim() !== current.firmwareCompanyId ||
    draft.firmwareDeviceId.trim() !== current.firmwareDeviceId
  )
}

function isDraftValid(draft: FirmwareIdentityDraft): boolean {
  return (
    draft.firmwareCompanyId.trim().length <= CAR_FIRMWARE_ID_MAX_LENGTH &&
    draft.firmwareDeviceId.trim().length <= CAR_FIRMWARE_ID_MAX_LENGTH
  )
}

/** View → edit → confirm before patching firmware IDs on a car. */
export function useCompanyCarFirmwareIdentity(car: Car) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const detail = LL.internalPanel.companies.detail

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [draft, setDraft] = useState<FirmwareIdentityDraft>(() =>
    draftFromCar(car),
  )

  const mutation = useMutation({
    mutationFn: function saveFirmwareIdentity(next: FirmwareIdentityDraft) {
      return updateCar(car.id, {
        firmwareCompanyId: next.firmwareCompanyId.trim(),
        firmwareDeviceId: next.firmwareDeviceId.trim(),
      })
    },
    onSuccess: async function onFirmwareIdentitySaved(updated) {
      queryClient.setQueryData(carKeys.detail(car.id), updated)
      await queryClient.invalidateQueries({ queryKey: carKeys.all })
      toast.success(detail.firmwareIdentityUpdated())
      setConfirmOpen(false)
      setOpen(false)
      setMode('view')
      setDraft(draftFromCar(updated))
    },
    onError: function onFirmwareIdentityError(error) {
      const duplicate =
        isApiClientError(error) &&
        error.apiError.fields?.some(
          (field) =>
            field.field === 'firmwareCompanyId' ||
            field.field === 'firmwareDeviceId',
        )

      toast.error(
        duplicate
          ? detail.duplicateFirmwareIdentity()
          : detail.firmwareIdentityUpdateFailed(),
      )
    },
  })

  function openModal() {
    setDraft(draftFromCar(car))
    setMode('view')
    setConfirmOpen(false)
    setOpen(true)
  }

  function closeModal() {
    if (mutation.isPending) {
      return
    }
    setOpen(false)
    setMode('view')
    setConfirmOpen(false)
  }

  function startEdit() {
    setDraft(draftFromCar(car))
    setMode('edit')
  }

  function cancelEdit() {
    setDraft(draftFromCar(car))
    setMode('view')
  }

  function continueToConfirm() {
    if (!isDraftDirty(car, draft) || !isDraftValid(draft)) {
      return
    }
    setOpen(false)
    setConfirmOpen(true)
  }

  function cancelConfirm() {
    if (mutation.isPending) {
      return
    }
    setConfirmOpen(false)
    setOpen(true)
    setMode('edit')
  }

  async function confirmSave() {
    try {
      await mutation.mutateAsync(draft)
    } catch {
      // Toast handled in onError; keep confirm open.
    }
  }

  return {
    open,
    mode,
    draft,
    confirmOpen,
    isPending: mutation.isPending,
    continueDisabled: !isDraftDirty(car, draft) || !isDraftValid(draft),
    openModal,
    closeModal,
    startEdit,
    cancelEdit,
    setDraft,
    continueToConfirm,
    cancelConfirm,
    confirmSave,
  }
}
