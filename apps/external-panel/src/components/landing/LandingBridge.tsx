import { LANDING_CHROME_BG, LANDING_GRID } from './landingChrome'

type LandingBridgeProps = {
  text: string
  accent?: string
  layer?: number
}

export function LandingBridge({ text, accent, layer = 2 }: LandingBridgeProps) {
  return (
    <section
      data-bridge
      className={`relative flex min-h-[42svh] items-center overflow-hidden px-6 py-20 sm:min-h-[44svh] sm:py-24 ${LANDING_CHROME_BG}`}
      style={{ zIndex: layer }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(var(--p)/0.08),transparent_65%)]"
      />
      <div aria-hidden className={LANDING_GRID} />
      {/* Soft handoff from the sticky image above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base-100 via-base-100/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-base-100 to-transparent"
      />

      <div
        data-reveal="bridge"
        className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center"
      >
        {accent ? (
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary"
            />
            {accent}
          </span>
        ) : null}
        <p className="text-xl font-semibold tracking-tight text-base-content sm:text-2xl lg:text-3xl">
          {text}
        </p>
      </div>
    </section>
  )
}
