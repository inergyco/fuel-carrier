import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CompanyNotification } from '@fuel-carrier/shared-types'
import { useEffect, useRef } from 'react'

type NotificationInboxListProps = {
  items: CompanyNotification[]
  locale: string
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onRetry: () => void
  onLoadMore: () => void
  onOpenItem: (item: CompanyNotification) => void
}

export function NotificationInboxList({
  items,
  locale,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onRetry,
  onLoadMore,
  onOpenItem,
}: NotificationInboxListProps) {
  const { LL } = useI18nContext()
  const copy = LL.externalPanel.notifications
  const listRef = useRef<HTMLUListElement>(null)
  const sentinelRef = useRef<HTMLLIElement>(null)

  useEffect(
    function loadNextPageWhenSentinelVisible() {
      const root = listRef.current
      const sentinel = sentinelRef.current
      if (!root || !sentinel || !hasNextPage || isFetchNextPageError) {
        return
      }

      const observer = new IntersectionObserver(
        function onSentinelVisible(entries) {
          if (
            entries.some((entry) => entry.isIntersecting) &&
            !isFetchingNextPage
          ) {
            onLoadMore()
          }
        },
        { root, rootMargin: '96px' },
      )
      observer.observe(sentinel)
      return function disconnectSentinel() {
        observer.disconnect()
      }
    },
    [hasNextPage, isFetchingNextPage, isFetchNextPageError, onLoadMore],
  )

  if (isLoading && items.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-base-content/50">{copy.loading()}</p>
    )
  }

  if (isError && items.length === 0) {
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
    <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
      {items.map((item) => (
        <NotificationInboxItem
          key={item.id}
          item={item}
          locale={locale}
          onOpen={onOpenItem}
        />
      ))}
      {hasNextPage || isFetchingNextPage || isFetchNextPageError ? (
        <li ref={sentinelRef} className="px-4 py-3 text-center">
          {isFetchingNextPage ? (
            <p className="text-xs text-base-content/40">{copy.loading()}</p>
          ) : null}
          {isFetchNextPageError ? (
            <button
              type="button"
              className="min-h-11 text-sm text-primary"
              onClick={onLoadMore}
            >
              {LL.common.queryError.retry()}
            </button>
          ) : null}
        </li>
      ) : null}
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
