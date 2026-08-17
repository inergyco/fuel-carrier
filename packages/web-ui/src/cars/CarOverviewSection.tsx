import type { Car } from '@fuel-carrier/shared-types'

export type CarOverviewSectionLabels = {
  detailTitle: () => string
  detailSubtitle: () => string
  licensePlate: () => string
  name: () => string
  note: () => string
  emptyCell: () => string
}

export type CarOverviewSectionProps = {
  car: Car
  labels: CarOverviewSectionLabels
}

export function CarOverviewSection({ car, labels }: CarOverviewSectionProps) {
  const emptyCell = labels.emptyCell()

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <h2 className="text-lg font-semibold tracking-tight">
        {labels.detailTitle()}
      </h2>
      <p className="mt-1 text-sm text-base-content/50">
        {labels.detailSubtitle()}
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.licensePlate()}
          </dt>
          <dd className="mt-1 font-mono text-sm font-medium">
            {car.licensePlate}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.name()}
          </dt>
          <dd className="mt-1 text-sm">{car.name ?? emptyCell}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.note()}
          </dt>
          <dd className="mt-1 text-sm whitespace-pre-wrap">
            {car.note ?? emptyCell}
          </dd>
        </div>
      </dl>
    </section>
  )
}
