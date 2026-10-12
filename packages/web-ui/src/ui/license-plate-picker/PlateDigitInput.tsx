import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  RefObject,
} from 'react'
import { toPersianDigits } from '@fuel-carrier/shared-validation/car/create'
import { cn } from '../../utils'

type PlateDigitInputProps = {
  ref: RefObject<HTMLInputElement | null>
  id?: string
  ariaLabel: string
  value: string
  maxLength: number
  disabled: boolean
  errorId?: string
  className?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onPaste: (event: ClipboardEvent<HTMLElement>) => void
}

export function PlateDigitInput({
  ref,
  id,
  ariaLabel,
  value,
  maxLength,
  disabled,
  errorId,
  className,
  onChange,
  onKeyDown,
  onPaste,
}: PlateDigitInputProps) {
  return (
    <input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaLabel}
      aria-describedby={errorId}
      disabled={disabled}
      maxLength={maxLength}
      value={toPersianDigits(value)}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      className={cn(
        'h-9 min-w-0 w-full rounded-sm border border-neutral-400/70 bg-white text-center text-lg font-bold tracking-wider text-neutral-900 tabular-nums outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-400 disabled:cursor-not-allowed sm:h-12 sm:text-xl',
        className,
      )}
    />
  )
}
