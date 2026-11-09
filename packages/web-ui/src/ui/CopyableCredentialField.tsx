import { useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Check, Copy } from '../icons'
import { Button } from './Button'
import { ICON_STROKE_WIDTH, iconSmClassName } from './iconClassName'
import { Input } from './Input'
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
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <Input
          label={label}
          name={type === 'password' ? 'password' : 'username'}
          type={type}
          value={value}
          readOnly
          autoComplete="off"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="mb-0 inline-flex size-10 shrink-0 items-center justify-center border border-base-content/12 bg-base-100/45 p-0"
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
  )
}
