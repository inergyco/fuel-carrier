import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  COMPANY_LOGO_MAX_BYTES,
  COMPANY_LOGO_MIME_TYPES,
  isCompanyLogoMimeType,
} from '@fuel-carrier/shared-validation/company/constants'
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
      formats={COMPANY_LOGO_MIME_TYPES}
      maxBytes={COMPANY_LOGO_MAX_BYTES}
      isAcceptedType={isCompanyLogoMimeType}
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
