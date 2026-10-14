import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CompanyUserLevels,
  NotificationChannels,
  type CompanyUserLevel,
  type NotificationBroadcast,
  type NotificationChannel,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import { keepPreviousData, useQuery } from '@fuel-carrier/web-ui/query'
import {
  Badge,
  Pagination,
  QueryErrorState,
  Skeleton,
} from '@fuel-carrier/web-ui/ui'
import { useState } from 'react'
import {
  fetchNotifications,
  notificationKeys,
} from '../../lib/api/notifications'

export function NotificationHistory() {
  const { LL, locale } = useI18nContext()
  const copy = LL.internalPanel.notifications
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const listParams = { page, limit }
  const historyQuery = useQuery({
    queryKey: notificationKeys.list(listParams),
    queryFn: () => fetchNotifications(listParams),
    placeholderData: keepPreviousData,
  })
  const result = historyQuery.data

  function formatWhen(value: string): string {
    return new Date(value).toLocaleString(locale)
  }

  function formatLevel(level: CompanyUserLevel): string {
    return level === CompanyUserLevels.ADMIN
      ? LL.common.companyUserLevel.admin()
      : LL.common.companyUserLevel.viewer()
  }

  function formatChannel(channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannels.BROWSER:
        return copy.channelBrowser()
    }
  }

  function formatCompanies(item: NotificationBroadcast): string {
    if (item.companies.length === 0) {
      return copy.companiesUnavailable()
    }

    const separator = locale === 'fa' ? '، ' : ', '
    return item.companies.map((company) => company.name).join(separator)
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
      <h2 className="text-base font-medium tracking-tight">{copy.historyTitle()}</h2>
      <p className="mt-1 text-sm text-base-content/50">{copy.historySubtitle()}</p>

      <div className="mt-5">
        {historyQuery.isLoading && !result ? (
          <NotificationHistorySkeleton label={copy.historyLoading()} />
        ) : historyQuery.isError ? (
          <QueryErrorState
            onRetry={() => void historyQuery.refetch()}
            labels={{
              loadFailed: LL.common.queryError.loadFailed(),
              retry: LL.common.queryError.retry(),
            }}
          />
        ) : (result?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-base-content/50">{copy.historyEmpty()}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {result?.items.map((item) => {
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-base-content/8 bg-base-200/30 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 text-sm font-medium">{item.title}</h3>
                    <time
                      className="text-xs text-base-content/45"
                      dateTime={item.createdAt}
                    >
                      {formatWhen(item.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-base-content/70">
                    {item.body}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge size="sm" variant="info">
                      {formatChannel(item.channel)}
                    </Badge>
                    {item.levels.map(function renderLevel(level) {
                      return (
                        <Badge key={level} size="sm">
                          {formatLevel(level)}
                        </Badge>
                      )
                    })}
                    <Badge size="sm" variant="secondary">
                      {copy.recipients({ count: item.recipientCount })}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-base-content/50">
                    {formatCompanies(item)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {result ? (
        <Pagination
          className="mt-4"
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.totalItems}
          limit={result.limit}
          onPageChange={setPage}
          onLimitChange={function changeLimit(nextLimit) {
            setLimit(nextLimit)
            setPage(1)
          }}
          labels={{
            previous: LL.common.pagination.previous,
            next: LL.common.pagination.next,
            showing: LL.common.pagination.showing,
            pageOf: LL.common.pagination.pageOf,
            perPage: LL.common.pagination.perPage,
          }}
        />
      ) : null}
    </section>
  )
}

function NotificationHistorySkeleton({ label }: { label: string }) {
  return (
    <ul
      className="flex flex-col gap-3"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: 3 }, function renderCard(_, index) {
        return (
          <li
            key={index}
            className="rounded-xl border border-base-content/8 bg-base-200/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-1/2" />
          </li>
        )
      })}
    </ul>
  )
}
