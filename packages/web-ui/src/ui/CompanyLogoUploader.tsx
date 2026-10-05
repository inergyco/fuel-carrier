import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MIME_TYPES,
  isImageUploadMimeType,
} from '@fuel-carrier/shared-validation/image-upload/constants'
import { CompanyBrandLogo } from './CompanyBrandLogo'
import { ImageUploader } from './ImageUploader'

interface CompanyLogoUploaderProps {
  logoUrl?: string | null
  error?: string
  disabled?: boolean
  onUploadFile: (file: File) => Promise<void>
  onRemove: () => Promise<void>
}

export function CompanyLogoUploader({
  logoUrl,
  error,
  disabled = false,
  onUploadFile,
  onRemove,
}: CompanyLogoUploaderProps) {
  const { LL } = useI18nContext()

  return (
    <ImageUploader
      imageUrl={logoUrl}
      formats={IMAGE_UPLOAD_MIME_TYPES}
      maxBytes={IMAGE_UPLOAD_MAX_BYTES}
      isAcceptedType={isImageUploadMimeType}
      emptyPreview={<CompanyBrandLogo />}
      label={LL.common.companyLogo.label()}
      error={error}
      disabled={disabled}
      labels={{
        choose: LL.common.companyLogo.choose(),
        change: LL.common.companyLogo.change(),
        remove: LL.common.companyLogo.remove(),
        uploading: LL.common.companyLogo.uploading(),
        invalidType: LL.common.companyLogo.invalidType(),
        tooLarge: LL.common.companyLogo.tooLarge(),
        uploadFailed: LL.common.companyLogo.uploadFailed(),
        hint: LL.common.companyLogo.hint(),
      }}
      onUploadFile={onUploadFile}
      onRemove={onRemove}
    />
  )
}
