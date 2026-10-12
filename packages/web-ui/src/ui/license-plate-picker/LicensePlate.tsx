import {
  isCompleteIranianLicensePlateParts,
  parseIranianLicensePlate,
  toPersianDigits,
} from '@fuel-carrier/shared-validation/car/create'
import { cn } from '../../utils'
import { IranPlateStripe } from './IranPlateStripe'

type LicensePlateSize = 'sm' | 'md'

type LicensePlateProps = {
  value: string
  size?: LicensePlateSize
  className?: string
}

const SIZE_CLASS: Record<
  LicensePlateSize,
  {
    shell: string
    text: string
    region: string
  }
> = {
  sm: {
    shell: 'h-6',
    text: 'gap-1 px-1.5 text-[11px]',
    region: 'min-w-6 px-1 text-[11px]',
  },
  md: {
    shell: 'h-8',
    text: 'gap-1.5 px-2 text-sm',
    region: 'min-w-8 px-1.5 text-sm',
  },
}

export function LicensePlate({
  value,
  size = 'sm',
  className,
}: LicensePlateProps) {
  const parts = parseIranianLicensePlate(value)
  const complete =
    parts != null && isCompleteIranianLicensePlateParts(parts)
  const sizeClass = SIZE_CLASS[size]

  return (
    <div
      dir="ltr"
      title={value}
      className={cn(
        'inline-flex max-w-full items-center overflow-hidden rounded border-2 border-neutral-800 bg-[#f3f3f3] text-neutral-900 shadow-sm',
        sizeClass.shell,
        className,
      )}
    >
      <IranPlateStripe size="sm" />

      {complete ? (
        <>
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center whitespace-nowrap font-bold tracking-wider tabular-nums',
              sizeClass.text,
            )}
          >
            <span>{toPersianDigits(parts.left)}</span>
            <span className="tracking-normal">{parts.letter}</span>
            <span>{toPersianDigits(parts.middle)}</span>
          </div>
          <div
            className={cn(
              'flex h-full shrink-0 items-center justify-center border-s-2 border-neutral-800 font-bold tabular-nums',
              sizeClass.region,
            )}
          >
            {toPersianDigits(parts.region)}
          </div>
        </>
      ) : (
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center truncate whitespace-nowrap px-1.5 font-bold tracking-wide',
            sizeClass.text,
          )}
        >
          {value || '—'}
        </div>
      )}
    </div>
  )
}
