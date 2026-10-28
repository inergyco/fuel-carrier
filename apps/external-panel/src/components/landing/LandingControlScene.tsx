import { useI18nContext } from '@fuel-carrier/i18n/react'

/** Depot → vehicle → delivery, drawn inside the control photograph card. */
export function LandingControlScene() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing.flow
  const steps = [
    { title: t.depot(), note: t.depotNote() },
    { title: t.vehicle(), note: t.vehicleNote() },
    { title: t.delivery(), note: t.deliveryNote() },
  ]

  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {steps.map(function renderStep(step, index) {
        return (
          <li
            key={step.title}
            className="rounded-xl border border-base-content/10 bg-base-content/5 px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              0{index + 1}
            </p>
            <p className="mt-1 font-semibold tracking-tight">{step.title}</p>
            <p className="mt-1 text-sm text-base-content/60">{step.note}</p>
          </li>
        )
      })}
    </ol>
  )
}
