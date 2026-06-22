import type { ReactNode } from 'react'
import type { ButtonVariant } from './Button'
import { Modal, ModalActions } from './Modal'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  loadingLabel?: ReactNode
  confirmVariant?: ButtonVariant
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
  loadingLabel,
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      size="sm"
      title={title}
      description={description}
      onClose={onCancel}
      closeDisabled={loading}
      footer={
        <ModalActions
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onCancel={onCancel}
          onConfirm={onConfirm}
          loading={loading}
          loadingLabel={loadingLabel}
          confirmVariant={confirmVariant}
        />
      }
    />
  )
}
