import { useI18nContext } from '@fuel-carrier/i18n/react'

const levels = ['72%', '38%', '84%'] as const

/** Sample operating rows. The stage photograph is the fleet visual. */
export function LandingFleetScene() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing
  const home = LL.externalPanel.home
  const rows = [
    {
      name: t.samples.unitA(),
      status: home.statusMoving(),
      custody: t.telemetry.custodyValue(),
      level: levels[0],
      tone: 'primary' as const,
    },
    {
      name: t.samples.unitB(),
      status: home.statusStopped(),
      custody: t.samples.open(),
      level: levels[1],
      tone: 'warning' as const,
    },
    {
      name: t.samples.unitC(),
      status: home.statusOffline(),
      custody: t.telemetry.custodyValue(),
      level: levels[2],
      tone: 'primary' as const,
    },
  ]

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-warning">
        {t.sampleKicker()}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map(function renderRow(row) {
          return (
            <li
              key={row.name}
              className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl border border-base-content/10 bg-base-content/5 px-3 py-2.5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_4.5rem] sm:items-center"
            >
              <span className="font-medium">{row.name}</span>
              <span className="text-sm text-primary">{row.status}</span>
              <span className="text-sm text-base-content/70">{row.custody}</span>
              <span
                aria-hidden
                className="col-span-2 mt-1 h-1.5 overflow-hidden rounded-full bg-base-content/10 sm:col-span-1 sm:mt-0"
              >
                <span
                  className={
                    row.tone === 'primary'
                      ? 'block h-full rounded-full bg-primary'
                      : 'block h-full rounded-full bg-warning'
                  }
                  style={{ width: row.level }}
                />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-base-content/55">
        {t.sampleNote()}
      </p>
    </div>
  )
}
