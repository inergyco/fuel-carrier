import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MIME_TYPES,
  isImageUploadMimeType,
} from '@fuel-carrier/shared-validation/image-upload/constants'
import { User } from '../icons'
import { ICON_STROKE_WIDTH } from './iconClassName'
import { ImageUploader } from './ImageUploader'

interface DriverImageUploaderProps {
  imageUrl?: string | null
  error?: string
  disabled?: boolean
  onUploadFile: (file: File) => Promise<void>
  onRemove: () => Promise<void>
}

export function DriverImageUploader({
  imageUrl,
  error,
  disabled = false,
  onUploadFile,
  onRemove,
}: DriverImageUploaderProps) {
  const { LL } = useI18nContext()

  return (
    <ImageUploader
      imageUrl={imageUrl}
      formats={IMAGE_UPLOAD_MIME_TYPES}
      maxBytes={IMAGE_UPLOAD_MAX_BYTES}
      isAcceptedType={isImageUploadMimeType}
      emptyPreview={
        <User
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
          className="size-8 text-base-content/40"
        />
      }
      label={LL.common.driverImage.label()}
      error={error}
      disabled={disabled}
      labels={{
        choose: LL.common.driverImage.choose(),
        change: LL.common.driverImage.change(),
        remove: LL.common.driverImage.remove(),
        uploading: LL.common.driverImage.uploading(),
        invalidType: LL.common.driverImage.invalidType(),
        tooLarge: LL.common.driverImage.tooLarge(),
        uploadFailed: LL.common.driverImage.uploadFailed(),
        hint: LL.common.driverImage.hint(),
      }}
      onUploadFile={onUploadFile}
      onRemove={onRemove}
    />
  )
}
