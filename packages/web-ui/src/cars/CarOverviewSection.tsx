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
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-5 backdrop-blur-sm md:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {labels.detailTitle()}
        </h2>
        <p className="text-sm text-base-content/50">{labels.detailSubtitle()}</p>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-xl border border-base-content/6 bg-base-100/20 px-4 py-3.5 sm:px-5 sm:py-4">
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.licensePlate()}
          </dt>
          <dd className="mt-1.5 font-mono text-sm font-medium">
            {car.licensePlate}
          </dd>
        </div>
        <div className="rounded-xl border border-base-content/6 bg-base-100/20 px-4 py-3.5 sm:px-5 sm:py-4">
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.name()}
          </dt>
          <dd className="mt-1.5 text-sm">{car.name ?? emptyCell}</dd>
        </div>
        <div className="rounded-xl border border-base-content/6 bg-base-100/20 px-4 py-3.5 sm:col-span-2 sm:px-5 sm:py-4">
          <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
            {labels.note()}
          </dt>
          <dd className="mt-1.5 text-sm whitespace-pre-wrap">
            {car.note ?? emptyCell}
          </dd>
        </div>
      </dl>
    </section>
  )
}
