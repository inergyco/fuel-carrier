import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from './Button'
import { Modal } from './Modal'

type ImagePreviewModalProps = {
  open: boolean
  src: string
  alt?: string
  title?: string
  onClose: () => void
}

export function ImagePreviewModal({
  open,
  src,
  alt = '',
  title,
  onClose,
}: ImagePreviewModalProps) {
  const { LL } = useI18nContext()
  const closeLabel = LL.common.close()

  return (
    <Modal
      open={open}
      title={title || alt || closeLabel}
      onClose={onClose}
      size="lg"
      footer={
        <Button
          type="button"
          variant="ghost"
          className="h-11 min-h-11 w-full border border-base-content/8 bg-base-100/40 sm:w-auto sm:px-4"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      }
    >
      <div className="flex max-h-[min(70svh,36rem)] items-center justify-center rounded-xl bg-base-300/30 p-2 sm:p-3">
        <img
          src={src}
          alt={alt}
          className="max-h-[min(65svh,32rem)] max-w-full rounded-lg object-contain"
        />
      </div>
    </Modal>
  )
}
