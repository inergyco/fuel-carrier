import type { ChangeEvent } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { Button, CopyableCredentialField, Input, Modal, ModalActions } from '../ui'

export type FirmwareIdentityDraft = {
  firmwareCompanyId: string
  firmwareDeviceId: string
}

export type CarFirmwareIdentityModalLabels = {
  title: () => string
  description: () => string
  editDescription: () => string
  firmwareCompanyId: () => string
  firmwareDeviceId: () => string
  empty: () => string
  dismiss: () => string
  edit: () => string
  cancel: () => string
  continue: () => string
}

export type CarFirmwareIdentityModalProps = {
  open: boolean
  car: Car | null
  mode: 'view' | 'edit'
  draft: FirmwareIdentityDraft
  continueDisabled?: boolean
  labels: CarFirmwareIdentityModalLabels
  onClose: () => void
  onEdit: () => void
  onCancelEdit: () => void
  onDraftChange: (draft: FirmwareIdentityDraft) => void
  onContinue: () => void
}

/** View or edit human-readable firmware IDs (save is confirmed separately). */
export function CarFirmwareIdentityModal({
  open,
  car,
  mode,
  draft,
  continueDisabled = false,
  labels,
  onClose,
  onEdit,
  onCancelEdit,
  onDraftChange,
  onContinue,
}: CarFirmwareIdentityModalProps) {
  const empty = labels.empty()
  const editing = mode === 'edit'

  function handleCompanyIdChange(event: ChangeEvent<HTMLInputElement>) {
    onDraftChange({
      ...draft,
      firmwareCompanyId: event.target.value,
    })
  }

  function handleDeviceIdChange(event: ChangeEvent<HTMLInputElement>) {
    onDraftChange({
      ...draft,
      firmwareDeviceId: event.target.value,
    })
  }

  return (
    <Modal
      open={open}
      title={labels.title()}
      description={
        editing ? labels.editDescription() : labels.description()
      }
      onClose={editing ? onCancelEdit : onClose}
      footer={
        editing ? (
          <ModalActions
            cancelLabel={labels.cancel()}
            confirmLabel={labels.continue()}
            onCancel={onCancelEdit}
            onConfirm={onContinue}
            confirmDisabled={continueDisabled}
          />
        ) : (
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-11 min-h-11 w-full border border-base-content/8 bg-base-100/40 sm:w-auto sm:px-4"
              onClick={onEdit}
            >
              {labels.edit()}
            </Button>
            <Button
              type="button"
              className="h-11 min-h-11 w-full sm:w-auto sm:px-6"
              onClick={onClose}
            >
              {labels.dismiss()}
            </Button>
          </div>
        )
      }
    >
      {car ? (
        <div className="flex flex-col gap-4 w-full">
          {editing ? (
            <>
              <Input
                label={labels.firmwareCompanyId()}
                name="firmwareCompanyId"
                value={draft.firmwareCompanyId}
                onChange={handleCompanyIdChange}
                dir="ltr"
                autoComplete="off"
              />
              <Input
                label={labels.firmwareDeviceId()}
                name="firmwareDeviceId"
                value={draft.firmwareDeviceId}
                onChange={handleDeviceIdChange}
                dir="ltr"
                autoComplete="off"
              />
            </>
          ) : (
            <>
              <CopyableCredentialField
                label={labels.firmwareCompanyId()}
                value={car.firmwareCompanyId?.trim() || empty}
              />
              <CopyableCredentialField
                label={labels.firmwareDeviceId()}
                value={car.firmwareDeviceId?.trim() || empty}
              />
            </>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
