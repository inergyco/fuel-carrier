import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useCtaMotion } from './useCtaMotion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type LandingSignInProps = {
  label: string
  /** Shorter label for narrow viewports (shown below `sm`). */
  shortLabel?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Larger ambient rings + stronger magnetic pull for hero / final CTA */
  spotlight?: boolean
  /** Soft magnetic field radius outside the button (px). */
  proximity?: number
}

const sizeClass = {
  sm: 'h-11 px-3.5 text-sm sm:px-5',
  md: 'h-12 px-7 text-sm',
  lg: 'h-14 px-8 text-base',
}

export function LandingSignIn({
  label,
  shortLabel,
  className,
  size = 'md',
  spotlight = false,
  proximity = 0,
}: LandingSignInProps) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const sheenRef = useRef<HTMLSpanElement>(null)
  const ringsRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const motionOk = !usePrefersReducedMotion()

  useCtaMotion({
    rootRef,
    sheenRef,
    ringsRef,
    arrowRef,
    enabled: motionOk,
    spotlight,
    proximity,
  })

  return (
    <span
      className={cn(
        'relative inline-flex',
        spotlight && 'p-3',
        className,
      )}
    >
      {spotlight ? (
        <span
          ref={ringsRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span
            data-ring
            className="absolute size-full rounded-full border border-primary/35"
          />
          <span
            data-ring
            className="absolute size-full rounded-full border border-primary/25"
          />
        </span>
      ) : null}

      <Link
        ref={rootRef}
        to="/login"
        search={{ redirect: undefined }}
        className={cn(
          'relative z-10 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-semibold tracking-wide text-primary-content shadow-md shadow-primary/30 will-change-transform',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-base-content',
          sizeClass[size],
        )}
      >
        <span
          ref={sheenRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-primary-content/25 to-transparent"
        />
        <span className="relative">
          {shortLabel ? (
            <>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : (
            label
          )}
        </span>
        <span className="inline-flex rtl:-scale-x-100">
          <ArrowRight
            ref={arrowRef}
            aria-hidden
            className={cn(
              'relative size-4',
              shortLabel && 'hidden sm:block',
            )}
          />
        </span>
      </Link>
    </span>
  )
}
