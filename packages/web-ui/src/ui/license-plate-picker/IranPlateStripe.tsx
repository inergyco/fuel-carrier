import { cn } from '../../utils'

type IranPlateStripeProps = {
  size?: 'sm' | 'md'
}

export function IranPlateStripe({ size = 'md' }: IranPlateStripeProps) {
  if (size === 'sm') {
    return (
      <div className="flex h-full w-4 shrink-0 flex-col items-center justify-center bg-[#003399] px-px">
        <div className="h-2.5 w-2.5 overflow-hidden rounded-[1px]" aria-hidden>
          <div className="h-1/3 bg-[#239f40]" />
          <div className="h-1/3 bg-white" />
          <div className="h-1/3 bg-[#da0000]" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-9 shrink-0 flex-col items-center justify-between bg-[#003399] px-0.5 py-1 text-white sm:w-11 sm:py-1.5',
      )}
    >
      <div
        className="h-3 w-5 overflow-hidden rounded-[1px] sm:h-3.5 sm:w-6"
        aria-hidden
      >
        <div className="h-1/3 bg-[#239f40]" />
        <div className="h-1/3 bg-white" />
        <div className="h-1/3 bg-[#da0000]" />
      </div>
      <span className="text-center text-[6px] leading-tight font-semibold tracking-tighter sm:text-[7px]">
        I.R.
        <br />
        IRAN
      </span>
    </div>
  )
}
