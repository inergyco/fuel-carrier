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
  /** First stage is the page heading. Later stages stay h2. */
  heading?: 'h1' | 'h2'
  wide?: boolean
  /** Hero image stays eager. Later photographs load lazily. */
  priority?: boolean
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
  heading = 'h2',
  wide = false,
  priority = false,
  children,
}: LandingStageProps) {
  const Title = heading === 'h1' ? 'h1' : 'h2'

  return (
    <section
      id={id}
      data-stage
      className="relative h-[165svh] scroll-mt-32 sm:scroll-mt-24"
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
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
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
          <LandingCard align={align} wide={wide}>
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
            <Title
              data-line
              className="mt-4 text-3xl font-bold tracking-tight text-balance text-base-content sm:text-4xl lg:text-5xl"
            >
              {title}
            </Title>
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
