import { useRef } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LandingBridge } from './LandingBridge'
import { LandingCursor } from './LandingCursor'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingSignIn } from './LandingSignIn'
import { LandingStage } from './LandingStage'
import { LANDING_CHROME_BG } from './landingChrome'
import { landingAssets } from './landingAssets'
import { useLandingScroll } from './useLandingScroll'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function LandingPage() {
  const { LL } = useI18nContext()
  const rootRef = useRef<HTMLElement>(null)
  const motionOk = !usePrefersReducedMotion()
  useLandingScroll(rootRef, motionOk)
  const t = LL.externalPanel.landing

  return (
    <main id="top" ref={rootRef} className="bg-base-100 text-base-content">
      <LandingCursor />
      <LandingHeader />

      <LandingStage
        layer={1}
        image={landingAssets.hero}
        eyebrow={t.brandSubtitle()}
        title={t.brand()}
        helper={t.headline()}
        body={t.description()}
        imagePosition="30% center"
      >
        <LandingSignIn label={t.signIn()} size="lg" spotlight />
      </LandingStage>

      <LandingBridge layer={2} text={t.bridges.afterHero()} />

      <LandingStage
        id="fleet"
        layer={3}
        image={landingAssets.fleet}
        eyebrow={t.header.fleet()}
        title={t.chapters.fleetTitle()}
        helper={t.chapters.fleetHelper()}
        body={t.chapters.fleetBody()}
        imagePosition="62% 58%"
        imageScale={1.18}
        align="end"
      />

      <LandingBridge layer={4} text={t.bridges.afterFleet()} accent="01" />

      <LandingStage
        id="live"
        layer={5}
        image={landingAssets.live}
        eyebrow={t.header.live()}
        title={t.chapters.liveTitle()}
        helper={t.chapters.liveHelper()}
        body={t.chapters.liveBody()}
        imagePosition="91% center"
      />

      <LandingBridge layer={6} text={t.bridges.afterLive()} accent="02" />

      <LandingStage
        id="control"
        layer={7}
        image={landingAssets.control}
        eyebrow={t.header.control()}
        title={t.chapters.controlTitle()}
        helper={t.chapters.controlHelper()}
        body={t.chapters.controlBody()}
        align="end"
        imagePosition="67% center"
      />

      <LandingBridge layer={8} text={t.bridges.afterControl()} accent="03" />

      <section
        data-bridge
        className={`relative z-9 flex min-h-[64svh] flex-col items-center justify-center overflow-hidden px-6 py-28 text-center sm:min-h-[72svh] sm:py-36 ${LANDING_CHROME_BG}`}
      >
        <img
          aria-hidden
          src={landingAssets.liveOps}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover object-center opacity-[0.22] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_12%,#000_72%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_12%,#000_72%,transparent_100%)] [[data-theme=external-dark]_&]:opacity-[0.26]"
          decoding="async"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-base-100/60 in-data-[theme=external-dark]:bg-base-100/55"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(var(--p)/0.08),transparent_65%)]"
        />
        <div
          data-reveal="cta"
          className="relative mx-auto flex w-full max-w-xl flex-col items-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-5xl">
            {t.cta.title()}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-base-content/55">
            {t.cta.body()}
          </p>
          <LandingSignIn
            label={t.cta.signIn()}
            size="lg"
            spotlight
            className="mt-9"
          />
        </div>
      </section>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </main>
  );
}
