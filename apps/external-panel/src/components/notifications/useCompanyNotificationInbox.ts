import type { CompanyNotification } from '@fuel-carrier/shared-types'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@fuel-carrier/web-ui/query'
import {
  companyNotificationKeys,
  fetchCompanyNotifications,
  fetchUnreadNotificationCount,
  markAllCompanyNotificationsRead,
  markCompanyNotificationRead,
  NOTIFICATION_POLL_MS,
} from '../../lib/api/notifications'

const EMPTY_ITEMS: CompanyNotification[] = []

export function useCompanyNotificationInbox() {
  const queryClient = useQueryClient()
  const inboxQuery = useInfiniteQuery({
    queryKey: companyNotificationKeys.inbox,
    queryFn: ({ pageParam }) => fetchCompanyNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchOnWindowFocus: true,
  })
  const unreadQuery = useQuery({
    queryKey: companyNotificationKeys.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: NOTIFICATION_POLL_MS,
    refetchOnWindowFocus: true,
  })

  function refreshInbox() {
    void queryClient.invalidateQueries({
      queryKey: companyNotificationKeys.all,
    })
  }

  const markReadMutation = useMutation({
    mutationFn: markCompanyNotificationRead,
    onSuccess: refreshInbox,
  })
  const markAllMutation = useMutation({
    mutationFn: markAllCompanyNotificationsRead,
    onSuccess: refreshInbox,
  })

  function handleOpenItem(item: CompanyNotification) {
    if (item.readAt) {
      return
    }

    void markReadMutation.mutateAsync(item.id)
  }

  function handleMarkAllRead() {
    void markAllMutation.mutateAsync()
  }

  function retryInbox() {
    void inboxQuery.refetch()
  }

  function handleLoadMore() {
    if (!inboxQuery.hasNextPage || inboxQuery.isFetchingNextPage) {
      return
    }

    void inboxQuery.fetchNextPage()
  }

  return {
    items:
      inboxQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ITEMS,
    unreadCount: unreadQuery.data?.count ?? 0,
    isLoading: inboxQuery.isLoading,
    isError: inboxQuery.isError,
    hasNextPage: inboxQuery.hasNextPage,
    isFetchingNextPage: inboxQuery.isFetchingNextPage,
    isFetchNextPageError: inboxQuery.isFetchNextPageError,
    markAllPending: markAllMutation.isPending,
    retryInbox,
    handleLoadMore,
    handleOpenItem,
    handleMarkAllRead,
  }
}
