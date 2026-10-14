import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CompanyNotification } from '@fuel-carrier/shared-types'
import type { BrowserPermission } from './useBrowserNotifications'

type NotificationInboxProps = {
  items: CompanyNotification[]
  unreadCount: number
  isLoading: boolean
  isError: boolean
  markAllPending: boolean
  permission: BrowserPermission
  onMarkAllRead: () => void
  onEnableBrowser: () => void
  onRetry: () => void
  onOpenItem: (item: CompanyNotification) => void
}

export function NotificationInbox({
  items,
  unreadCount,
  isLoading,
  isError,
  markAllPending,
  permission,
  onMarkAllRead,
  onEnableBrowser,
  onRetry,
  onOpenItem,
}: NotificationInboxProps) {
  const { LL, locale } = useI18nContext()
  const copy = LL.externalPanel.notifications

  return (
    <div
      role="dialog"
      aria-label={copy.title()}
      className="absolute end-0 z-30 mt-2 flex max-h-[min(28rem,calc(100svh-5rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-base-content/8 bg-base-100/95 shadow-lg backdrop-blur-xl"
    >
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
      <NotificationInboxBody
        items={items}
        locale={locale}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        onOpenItem={onOpenItem}
      />
    </div>
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

function NotificationInboxBody({
  items,
  locale,
  isLoading,
  isError,
  onRetry,
  onOpenItem,
}: {
  items: CompanyNotification[]
  locale: string
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onOpenItem: (item: CompanyNotification) => void
}) {
  const { LL } = useI18nContext()
  const copy = LL.externalPanel.notifications

  if (isLoading && items.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-base-content/50">{copy.loading()}</p>
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-base-content/50">{copy.loadFailed()}</p>
        <button
          type="button"
          className="mt-2 min-h-11 text-sm text-primary"
          onClick={onRetry}
        >
          {LL.common.queryError.retry()}
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-base-content/50">{copy.empty()}</p>
    )
  }

  return (
    <ul className="min-h-0 flex-1 overflow-y-auto">
      {items.map((item) => (
        <NotificationInboxItem
          key={item.id}
          item={item}
          locale={locale}
          onOpen={onOpenItem}
        />
      ))}
    </ul>
  )
}

function NotificationInboxItem({
  item,
  locale,
  onOpen,
}: {
  item: CompanyNotification
  locale: string
  onOpen: (item: CompanyNotification) => void
}) {
  function handleOpen() {
    onOpen(item)
  }

  return (
    <li className="border-b border-base-content/8 last:border-b-0">
      <button
        type="button"
        className="flex w-full min-h-11 items-start gap-3 px-4 py-3 text-start hover:bg-base-content/5"
        onClick={handleOpen}
      >
        {item.readAt ? (
          <span className="mt-1.5 size-2 shrink-0" aria-hidden />
        ) : (
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{item.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs text-base-content/60">
            {item.body}
          </span>
          <time
            className="mt-1 block text-[10px] text-base-content/40"
            dateTime={item.createdAt}
          >
            {new Date(item.createdAt).toLocaleString(locale)}
          </time>
        </span>
      </button>
    </li>
  )
}
