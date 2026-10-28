import { useRef } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LandingBridge } from './LandingBridge'
import { LandingClose } from './LandingClose'
import { LandingControlScene } from './LandingControlScene'
import { LandingCursor } from './LandingCursor'
import { LandingFleetScene } from './LandingFleetScene'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingLiveScene } from './LandingLiveScene'
import { LandingSignIn } from './LandingSignIn'
import { LandingStage } from './LandingStage'
import { LandingTelemetry } from './LandingTelemetry'
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
        heading="h1"
        wide
        priority
        layer={1}
        image={landingAssets.hero}
        eyebrow={t.eyebrow()}
        title={t.headline()}
        body={t.description()}
        imagePosition="30% center"
      >
        <LandingSignIn label={t.signIn()} size="lg" spotlight />
        <LandingTelemetry />
      </LandingStage>

      <LandingBridge layer={2} text={t.bridges.afterHero()} />

      <LandingStage
        id="fleet"
        wide
        layer={3}
        image={landingAssets.fleet}
        eyebrow={t.header.fleet()}
        title={t.chapters.fleetTitle()}
        helper={t.chapters.fleetHelper()}
        body={t.chapters.fleetBody()}
        imagePosition="62% 58%"
        imageScale={1.18}
        align="end"
      >
        <LandingFleetScene />
      </LandingStage>

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
      >
        <LandingLiveScene />
      </LandingStage>

      <LandingBridge layer={6} text={t.bridges.afterLive()} accent="02" />

      <LandingStage
        id="control"
        wide
        layer={7}
        image={landingAssets.control}
        eyebrow={t.header.control()}
        title={t.chapters.controlTitle()}
        helper={t.chapters.controlHelper()}
        body={t.chapters.controlBody()}
        align="end"
        imagePosition="67% center"
      >
        <LandingControlScene />
      </LandingStage>

      <LandingBridge layer={8} text={t.bridges.afterControl()} accent="03" />

      <LandingClose />

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </main>
  )
}
