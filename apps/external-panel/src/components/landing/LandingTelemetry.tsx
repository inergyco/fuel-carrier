import { useI18nContext } from '@fuel-carrier/i18n/react'

export function LandingTelemetry() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing
  const status = LL.externalPanel.home.statusMoving()

  return (
    <div className="mt-5 border-t border-base-content/10 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-warning">
        {t.sampleKicker()}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/45">
            {t.telemetry.vehicle()}
          </dt>
          <dd className="mt-1 font-semibold">{t.telemetry.vehicleValue()}</dd>
          <dd className="text-xs text-base-content/60">{status}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/45">
            {t.telemetry.volume()}
          </dt>
          <dd className="mt-2 space-y-1.5">
            <FuelBar label={t.telemetry.regular()} width="70%" tone="primary" />
            <FuelBar label={t.telemetry.super()} width="46%" tone="warning" />
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/45">
            {t.telemetry.custody()}
          </dt>
          <dd className="mt-1 font-semibold">{t.telemetry.custodyValue()}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-base-content/55">
        {t.sampleNote()}
      </p>
    </div>
  )
}

function FuelBar({
  label,
  width,
  tone,
}: {
  label: string
  width: string
  tone: 'primary' | 'warning'
}) {
  return (
    <div>
      <p className="text-[11px] text-base-content/70">{label}</p>
      <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-base-content/10">
        <div
          className={
            tone === 'primary'
              ? 'h-full rounded-full bg-primary'
              : 'h-full rounded-full bg-warning'
          }
          style={{ width }}
        />
      </div>
    </div>
  )
}
