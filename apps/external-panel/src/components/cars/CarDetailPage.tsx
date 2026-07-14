import { Link, useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button, ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useCarQuery } from './useCarQuery'

interface CarDetailPageProps {
  carId: string
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { carQuery, isNotFound } = useCarQuery(carId)
  const emptyCell = LL.externalPanel.cars.emptyCell()

  function handleBackToList() {
    void navigate({ to: '/cars' })
  }

  const title =
    carQuery.data?.name?.trim() ||
    carQuery.data?.licensePlate ||
    LL.externalPanel.cars.detailTitle()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          to="/cars"
          className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/65 transition-colors hover:text-base-content"
        >
          <ArrowLeft
            className={cn(iconMdClassName, 'rtl:rotate-180')}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          {LL.externalPanel.cars.backToList()}
        </Link>

        {carQuery.isLoading ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.cars.loading()}
          </p>
        ) : isNotFound || !carQuery.data ? (
          <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
            <h1 className="text-xl font-semibold tracking-tight">
              {LL.externalPanel.cars.notFound()}
            </h1>
            <p className="mt-2 text-sm text-base-content/50">
              {LL.externalPanel.cars.notFoundDescription()}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-4 h-10 border border-base-content/8 bg-base-100/40 px-4"
              onClick={handleBackToList}
            >
              {LL.externalPanel.cars.backToList()}
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            <p className="mt-1 font-mono text-sm text-base-content/50">
              {carQuery.data.licensePlate}
            </p>
          </>
        )}
      </div>

      {carQuery.data ? (
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
              <dd className="mt-1 font-mono text-sm font-medium">
                {carQuery.data.licensePlate}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                {LL.externalPanel.cars.name()}
              </dt>
              <dd className="mt-1 text-sm">{carQuery.data.name ?? emptyCell}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                {LL.externalPanel.cars.note()}
              </dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap">
                {carQuery.data.note ?? emptyCell}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  )
}
