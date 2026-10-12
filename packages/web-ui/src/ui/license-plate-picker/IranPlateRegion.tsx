import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  RefObject,
} from 'react'
import { PlateDigitInput } from './PlateDigitInput'

type IranPlateRegionProps = {
  regionRef: RefObject<HTMLInputElement | null>
  value: string
  disabled: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onPaste: (event: ClipboardEvent<HTMLElement>) => void
}

export function IranPlateRegion({
  regionRef,
  value,
  disabled,
  onChange,
  onKeyDown,
  onPaste,
}: IranPlateRegionProps) {
  return (
    <div className="flex w-14 shrink-0 flex-col border-s-2 border-neutral-800 sm:w-16">
      <div className="flex h-5 items-center justify-center border-b border-neutral-800 text-[10px] font-bold tracking-wide sm:h-6 sm:text-xs">
        ایران
      </div>
      <div className="flex flex-1 items-center px-1">
        <PlateDigitInput
          ref={regionRef}
          ariaLabel="City code"
          value={value}
          maxLength={2}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          className="h-7!"
        />
      </div>
    </div>
  )
}
