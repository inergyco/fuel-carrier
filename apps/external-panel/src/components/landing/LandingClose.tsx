import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LandingCard } from './LandingCard'
import { LandingSignIn } from './LandingSignIn'
import { landingAssets } from './landingAssets'

function BayOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(8,16,32,0.38)_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(color-mix(in_oklab,var(--color-primary)_28%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-primary)_22%,transparent)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/25 to-transparent" />
      <span className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <span className="absolute start-5 top-5 size-5 border-s border-t border-primary/80" />
      <span className="absolute end-5 top-5 size-5 border-e border-t border-primary/80" />
      <span className="absolute start-5 bottom-5 size-5 border-s border-b border-primary/80" />
      <span className="absolute end-5 bottom-5 size-5 border-e border-b border-primary/80" />
    </div>
  )
}

export function LandingClose() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing

  return (
    <section className="relative z-9 overflow-hidden px-4 py-16 sm:px-8 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="size-112 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div data-reveal="cta" className="relative mx-auto w-full max-w-sm md:max-w-5xl">
        <LandingCard
          align="center"
          className="max-w-none"
          surfaceClassName="border border-base-content/12 bg-base-200/95"
        >
          <div className="md:grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-center">
            <figure className="relative -mx-7 -mt-7 overflow-hidden sm:-mx-9 sm:-mt-9 md:-my-9 md:-ms-9 md:me-0">
              <img
                src={landingAssets.liveOpsBay}
                alt=""
                className="aspect-4/5 w-full object-cover object-[center_58%] md:aspect-square md:object-[center_62%]"
                decoding="async"
                loading="lazy"
              />
              <BayOverlay />
            </figure>

            <div className="pt-7 text-center sm:pt-8 md:py-2 md:ps-10 md:text-start lg:ps-12">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-primary shadow-[0_0_10px] shadow-primary"
                />
                {t.footer.companyProduct()}
              </p>
              <h2 className="mx-auto mt-4 max-w-xs text-3xl font-bold tracking-tight text-balance text-base-content sm:text-4xl md:mx-0 md:max-w-md">
                {t.cta.title()}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-pretty text-base-content/60 sm:text-base md:mx-0">
                {t.cta.body()}
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <LandingSignIn label={t.cta.signIn()} size="lg" spotlight />
              </div>
            </div>
          </div>
        </LandingCard>
      </div>
    </section>
  );
}
