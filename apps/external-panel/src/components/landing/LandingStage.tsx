import { cn } from '@fuel-carrier/web-ui/utils'
import type { ReactNode } from 'react'
import { LandingCard } from './LandingCard'
import { LandingImageEdgeFade } from './LandingImageEdgeFade'

type LandingStageProps = {
  id?: string
  image: string
  eyebrow?: string
  title: string
  helper?: string
  body?: string
  align?: 'start' | 'end'
  imagePosition?: string
  imageScale?: number
  layer?: number
  children?: ReactNode
}

export function LandingStage({
  id,
  image,
  eyebrow,
  title,
  helper,
  body,
  align = 'start',
  imagePosition = 'center',
  imageScale = 1.05,
  layer = 1,
  children,
}: LandingStageProps) {
  return (
    <section
      id={id}
      data-stage
      className="relative h-[165svh] scroll-mt-16 sm:scroll-mt-20"
      style={{ zIndex: layer }}
    >
      <div className="sticky top-0 flex h-svh items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            data-sticky-image
            data-scale={String(imageScale)}
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover will-change-transform"
            style={{ objectPosition: imagePosition }}
            decoding="async"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <LandingImageEdgeFade edge="top" />
        <LandingImageEdgeFade edge="bottom" />

        <div
          data-reveal={align === 'end' ? 'end' : 'start'}
          className={cn(
            'relative z-10 w-full px-4 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-20',
            align === 'end' && 'flex justify-end',
          )}
        >
          <LandingCard align={align}>
            {eyebrow ? (
              <p
                data-line
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-primary shadow-[0_0_10px] shadow-primary"
                />
                {eyebrow}
              </p>
            ) : null}
            <h2
              data-line
              className="mt-4 text-3xl font-bold tracking-tight text-base-content sm:text-5xl"
            >
              {title}
            </h2>
            {helper ? (
              <p
                data-line
                className="mt-3 text-base font-medium leading-snug text-primary sm:text-lg"
              >
                {helper}
              </p>
            ) : null}
            {body ? (
              <p
                data-line
                className="mt-4 text-sm leading-relaxed text-base-content/60 sm:text-base"
              >
                {body}
              </p>
            ) : null}
            {children ? (
              <div data-line className="mt-8">
                {children}
              </div>
            ) : null}
          </LandingCard>
        </div>
      </div>
    </section>
  )
}
