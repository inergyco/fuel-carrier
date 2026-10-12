import type { ChangeEvent, ClipboardEvent, RefObject } from 'react'
import { IRANIAN_LICENSE_PLATE_LETTERS } from '@fuel-carrier/shared-validation/car/create'
import { cn } from '../../utils'

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
    <select
      ref={ref}
      aria-label="Plate letter"
      disabled={disabled}
      value={value}
      onChange={onChange}
      onPaste={onPaste}
      className={cn(
        'h-9 min-w-0 w-full cursor-pointer appearance-none rounded-sm border border-neutral-400/70 bg-white text-center text-lg font-bold text-neutral-900 outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-400 disabled:cursor-not-allowed sm:h-12 sm:text-xl',
        className,
      )}
    >
      <option value=""> </option>
      {IRANIAN_LICENSE_PLATE_LETTERS.map((letter) => (
        <option key={letter} value={letter}>
          {letter}
        </option>
      ))}
    </select>
  )
}
