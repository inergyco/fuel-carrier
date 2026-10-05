import type { ReactNode } from 'react'
import { ImageIcon } from '../icons'
import { ICON_STROKE_WIDTH } from './iconClassName'
import {
  FileUploader,
  type FileUploaderLabels,
  type FileUploaderProps,
} from './FileUploader'

export type ImageUploaderLabels = FileUploaderLabels

export type ImageUploaderProps = {
  imageUrl?: string | null
  /** Allowed image MIME types (also used for the file picker). */
  formats: readonly string[]
  maxBytes: number
  isAcceptedType?: (mimeType: string) => boolean
  /** Shown when there is no image yet. Defaults to a generic image icon. */
  emptyPreview?: ReactNode
  label?: string
  error?: string
  disabled?: boolean
  labels: ImageUploaderLabels
  onUploadFile: FileUploaderProps['onUploadFile']
  onRemove: FileUploaderProps['onRemove']
}

export function ImageUploader({
  imageUrl,
  formats,
  maxBytes,
  isAcceptedType,
  emptyPreview,
  label,
  error,
  disabled,
  labels,
  onUploadFile,
  onRemove,
}: ImageUploaderProps) {
  const preview = (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="max-h-14 max-w-14 object-contain"
        />
      ) : (
        (emptyPreview ?? (
          <ImageIcon
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
            className="size-8 text-base-content/40"
          />
        ))
      )}
    </div>
  )

  return (
    <FileUploader
      label={label}
      valueUrl={imageUrl}
      preview={preview}
      accept={formats}
      maxBytes={maxBytes}
      isAcceptedType={isAcceptedType}
      error={error}
      disabled={disabled}
      labels={labels}
      onUploadFile={onUploadFile}
      onRemove={onRemove}
    />
  )
}
