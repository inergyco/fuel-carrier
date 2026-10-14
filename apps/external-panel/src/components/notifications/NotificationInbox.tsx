import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CompanyNotification } from '@fuel-carrier/shared-types'
import { NotificationInboxList } from './NotificationInboxList'
import type { BrowserPermission } from './useBrowserNotifications'

type NotificationInboxProps = {
  items: CompanyNotification[]
  unreadCount: number
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  markAllPending: boolean
  permission: BrowserPermission
  onMarkAllRead: () => void
  onEnableBrowser: () => void
  onRetry: () => void
  onLoadMore: () => void
  onOpenItem: (item: CompanyNotification) => void
}

export function NotificationInbox({
  items,
  unreadCount,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  markAllPending,
  permission,
  onMarkAllRead,
  onEnableBrowser,
  onRetry,
  onLoadMore,
  onOpenItem,
}: NotificationInboxProps) {
  const { LL, locale } = useI18nContext()
  const copy = LL.externalPanel.notifications

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-base-content/8 px-4 py-3">
        <h2 className="text-sm font-medium">{copy.title()}</h2>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="min-h-11 text-xs text-primary"
            disabled={markAllPending}
            onClick={onMarkAllRead}
          >
            {copy.markAllRead()}
          </button>
        ) : null}
      </div>
      <NotificationPermissionNotice
        permission={permission}
        onEnable={onEnableBrowser}
      />
      <NotificationInboxList
        items={items}
        locale={locale}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        onRetry={onRetry}
        onLoadMore={onLoadMore}
        onOpenItem={onOpenItem}
      />
    </>
  )
}

function NotificationPermissionNotice({
  permission,
  onEnable,
}: {
  permission: BrowserPermission
  onEnable: () => void
}) {
  const { LL } = useI18nContext()
  const copy = LL.externalPanel.notifications

  if (permission === 'default') {
    return (
      <div className="border-b border-base-content/8 px-4 py-3">
        <button
          type="button"
          className="min-h-11 text-start text-sm text-primary"
          onClick={onEnable}
        >
          {copy.enableBrowser()}
        </button>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <p className="border-b border-base-content/8 px-4 py-3 text-xs text-base-content/50">
        {copy.browserDenied()}
      </p>
    )
  }

  if (permission === 'unsupported') {
    return (
      <p className="border-b border-base-content/8 px-4 py-3 text-xs text-base-content/50">
        {copy.browserUnsupported()}
      </p>
    )
  }

  return (
    <p className="border-b border-base-content/8 px-4 py-3 text-xs text-base-content/45">
      {copy.browserEnabled()}
    </p>
  )
}
