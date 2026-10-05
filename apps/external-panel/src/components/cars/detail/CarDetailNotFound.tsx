import { useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button, PageHeader } from '@fuel-carrier/web-ui/ui'
import { CarDetailBackLink } from './CarDetailBackLink'

export function CarDetailNotFound() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()

  function handleBackToList() {
    void navigate({ to: '/cars' })
  }

  return (
    <div>
      <div className="mb-6">
        <CarDetailBackLink />
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
          <PageHeader
            title={LL.externalPanel.cars.notFound()}
            subtitle={LL.externalPanel.cars.notFoundDescription()}
          />
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-10 border border-base-content/8 bg-base-100/40 px-4"
            onClick={handleBackToList}
          >
            {LL.externalPanel.cars.backToList()}
          </Button>
        </div>
      </div>
    </div>
  )
}
