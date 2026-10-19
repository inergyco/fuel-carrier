import type { ChangeEvent, ClipboardEvent, RefObject } from 'react'
import { IRANIAN_LICENSE_PLATE_LETTERS } from '@fuel-carrier/shared-validation/car/create'
import { cn } from '../../utils'
import { Select } from '../Select'

type PlateLetterSelectProps = {
  ref: RefObject<HTMLSelectElement | null>
  value: string
  disabled: boolean
  className?: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  onPaste: (event: ClipboardEvent<HTMLElement>) => void
}

export function PlateLetterSelect({
  ref,
  value,
  disabled,
  className,
  onChange,
  onPaste,
}: PlateLetterSelectProps) {
  return (
    <Select
      bare
      ref={ref}
      aria-label="Plate letter"
      disabled={disabled}
      value={value}
      onChange={onChange}
      onPaste={onPaste}
      className={cn('min-w-0 justify-end text-lg font-bold', className)}
    >
      {IRANIAN_LICENSE_PLATE_LETTERS.map((letter) => (
        <option key={letter} value={letter}>
          {letter}
        </option>
      ))}
    </Select>
  )
}
