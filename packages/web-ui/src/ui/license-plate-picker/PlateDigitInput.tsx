import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  RefObject,
} from 'react'
import { toPersianDigits } from '@fuel-carrier/shared-validation/car/create'
import { cn } from '../../utils'
import { Input } from '../Input'

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
    <Input
      bare
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
      className={cn('min-w-0 text-center text-lg font-bold', className)}
    />
  )
}
