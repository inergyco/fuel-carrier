import { useI18nContext } from "@fuel-carrier/i18n/react";
import { Bell } from "@fuel-carrier/web-ui/icons";
import {
  ICON_STROKE_WIDTH,
  iconMdClassName,
  Button,
  Popover,
} from "@fuel-carrier/web-ui/ui";
import { useState } from "react";
import { NotificationInbox } from "./NotificationInbox";
import { useBrowserNotifications } from "./useBrowserNotifications";
import { useCompanyNotificationInbox } from "./useCompanyNotificationInbox";

export function NotificationBell() {
  const { LL } = useI18nContext();
  const copy = LL.externalPanel.notifications;
  const [open, setOpen] = useState(false);
  const {
    items,
    unreadCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    markAllPending,
    retryInbox,
    handleLoadMore,
    handleOpenItem,
    handleMarkAllRead,
  } = useCompanyNotificationInbox();
  const { permission, requestPermission } = useBrowserNotifications({
    setOpen,
  });

  function handleToggle() {
    setOpen((current) => !current);
  }

  function handleEnableBrowser() {
    void requestPermission();
  }

  const label =
    unreadCount > 0
      ? copy.bellLabelUnread({ count: unreadCount })
      : copy.bellLabel();

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label={copy.title()}
      trigger={
        <span className="relative inline-flex">
          <Button
            variant="icon"
            aria-label={label}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={handleToggle}
          >
            <Bell
              strokeWidth={ICON_STROKE_WIDTH}
              className={iconMdClassName}
              aria-hidden
            />
          </Button>
          {unreadCount > 0 ? (
            <span className="pointer-events-none absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-content">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
      }
    >
      <NotificationInbox
        items={items}
        unreadCount={unreadCount}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        markAllPending={markAllPending}
        permission={permission}
        onMarkAllRead={handleMarkAllRead}
        onEnableBrowser={handleEnableBrowser}
        onRetry={retryInbox}
        onLoadMore={handleLoadMore}
        onOpenItem={handleOpenItem}
      />
    </Popover>
  );
}
