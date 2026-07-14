import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'

interface CarOverviewSectionProps {
  car: Car
}

export function CarOverviewSection({ car }: CarOverviewSectionProps) {
  const { LL } = useI18nContext()
  const emptyCell = LL.externalPanel.cars.emptyCell()

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        {LL.externalPanel.cars.detailTitle()}
      </h2>
      <p className="mt-1 text-sm text-base-content/50">
        {LL.externalPanel.cars.detailSubtitle()}
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {LL.externalPanel.cars.licensePlate()}
          </dt>
          <dd className="mt-1 font-mono text-sm font-medium">{car.licensePlate}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {LL.externalPanel.cars.name()}
          </dt>
          <dd className="mt-1 text-sm">{car.name ?? emptyCell}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {LL.externalPanel.cars.note()}
          </dt>
          <dd className="mt-1 text-sm whitespace-pre-wrap">
            {car.note ?? emptyCell}
          </dd>
        </div>
      </dl>
    </section>
  )
}
