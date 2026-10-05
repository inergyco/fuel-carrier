import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { Button } from './Button'
import { Field } from './Field'
import { useFieldIds } from './useFieldIds'

export type FileUploaderLabels = {
  choose: string
  change: string
  remove: string
  uploading: string
  invalidType: string
  tooLarge: string
  uploadFailed: string
  hint?: string
}

export type FileUploaderProps = {
  label?: string
  /** Current file URL used to decide choose vs change / show remove. */
  valueUrl?: string | null
  preview: ReactNode
  /** MIME types for the native file picker `accept` attribute. */
  accept: readonly string[]
  maxBytes: number
  /** Defaults to membership in `accept`. */
  isAcceptedType?: (mimeType: string) => boolean
  error?: string
  disabled?: boolean
  labels: FileUploaderLabels
  onUploadFile: (file: File) => Promise<void>
  onRemove: () => Promise<void>
}

export function FileUploader({
  label,
  valueUrl,
  preview,
  accept,
  maxBytes,
  isAcceptedType,
  error: errorProp,
  disabled = false,
  labels,
  onUploadFile,
  onRemove,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const visibleError = errorProp ?? error ?? undefined
  const { id, errorId } = useFieldIds({ error: visibleError })
  const hasValue = Boolean(valueUrl)
  const isDisabled = disabled || isBusy

  function matchesAcceptedType(mimeType: string) {
    if (isAcceptedType) {
      return isAcceptedType(mimeType)
    }

    return accept.includes(mimeType)
  }

  function handleChooseClick() {
    inputRef.current?.click()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!matchesAcceptedType(file.type)) {
      setError(labels.invalidType)
      return
    }

    if (file.size > maxBytes) {
      setError(labels.tooLarge)
      return
    }

    setError(null)
    setIsBusy(true)

    try {
      await onUploadFile(file)
    } catch {
      setError(labels.uploadFailed)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRemove() {
    setError(null)
    setIsBusy(true)

    try {
      await onRemove()
    } catch {
      setError(labels.uploadFailed)
    } finally {
      setIsBusy(false)
    }
  }

  function actionLabel() {
    if (isBusy) {
      return labels.uploading
    }

    if (hasValue) {
      return labels.change
    }

    return labels.choose
  }

  return (
    <Field label={label} error={visibleError} htmlFor={id} errorId={errorId}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {preview}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-auto px-4 normal-case tracking-normal"
            disabled={isDisabled}
            onClick={handleChooseClick}
          >
            {actionLabel()}
          </Button>
          {hasValue ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 border border-base-content/10 px-4"
              disabled={isDisabled}
              onClick={() => void handleRemove()}
            >
              {labels.remove}
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept.join(',')}
        className="sr-only"
        disabled={isDisabled}
        aria-describedby={errorId}
        onChange={(event) => void handleFileChange(event)}
      />
      {labels.hint ? (
        <p className="text-xs text-base-content/45">{labels.hint}</p>
      ) : null}
    </Field>
  )
}
