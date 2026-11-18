import { useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Check, Copy } from '../icons'
import { Button } from './Button'
import { Field } from './Field'
import { ICON_STROKE_WIDTH, iconSmClassName } from './IconButton'
import { Input } from './Input'
import { useFieldIds } from './useFieldIds'
import { useToast } from './toast'

const COPIED_RESET_MS = 1500

type CopyableCredentialFieldProps = {
  label: string
  value: string
  type?: 'text' | 'password'
}

export function CopyableCredentialField({
  label,
  value,
  type = 'text',
}: CopyableCredentialFieldProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const { id } = useFieldIds({})
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(LL.common.copied())
      window.setTimeout(function resetCopied() {
        setCopied(false)
      }, COPIED_RESET_MS)
    } catch {
      toast.error(LL.common.copyFailed())
    }
  }

  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          bare
          name={type === 'password' ? 'password' : 'username'}
          type={type}
          value={value}
          readOnly
          autoComplete="off"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="inline-flex size-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-base-content/10 bg-base-100/60 p-0"
          onClick={handleCopy}
          aria-label={LL.common.copy()}
        >
          {copied ? (
            <Check
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          ) : (
            <Copy
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          )}
        </Button>
      </div>
    </Field>
  )
}