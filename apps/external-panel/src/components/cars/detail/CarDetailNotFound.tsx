import { useNavigate, useRouter } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from '@fuel-carrier/web-ui/ui'

export function CarDetailNotFound() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const router = useRouter()

  function handleBackToList() {
    if (router.history.canGoBack()) {
      router.history.back()
      return
    }
    void navigate({ to: '/cars' })
  }

  return (
    <div>
      <div className="mb-6">
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 p-6 backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            className="h-10 border border-base-content/8 bg-base-100/40 px-4"
            onClick={handleBackToList}
          >
            {LL.externalPanel.cars.backToList()}
          </Button>
        </div>
      </div>
    </div>
  )
}
