import { useI18nContext } from '@fuel-carrier/i18n/react'
import { NotificationHistory } from '../../notifications/NotificationHistory'

type CompanyNotificationsSectionProps = {
  companyId: string
}

export function CompanyNotificationsSection({
  companyId,
}: CompanyNotificationsSectionProps) {
  const { LL } = useI18nContext()
  const copy = LL.internalPanel.companies.detail

  return (
    <NotificationHistory
      companyId={companyId}
      title={copy.notificationsTitle()}
      subtitle={copy.notificationsSubtitle()}
      empty={copy.notificationsEmpty()}
      loading={copy.notificationsLoading()}
      hideCompanies
    />
  )
}
