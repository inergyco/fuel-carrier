import { useI18nContext } from "@fuel-carrier/i18n/react";
import { Bell } from "@fuel-carrier/web-ui/icons";
import {
  ICON_STROKE_WIDTH,
  iconMdClassName,
  Button,
} from "@fuel-carrier/web-ui/ui";
import { useRef, useState } from "react";
import { NotificationInbox } from "./NotificationInbox";
import { useBrowserNotifications } from "./useBrowserNotifications";
import { useCompanyNotificationInbox } from "./useCompanyNotificationInbox";
import { usePopoverDismiss } from "./usePopoverDismiss";

export function NotificationBell() {
  const { LL } = useI18nContext();
  const copy = LL.externalPanel.notifications;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const {
    items,
    unreadCount,
    isLoading,
    isError,
    markAllPending,
    retryInbox,
    handleOpenItem,
    handleMarkAllRead,
  } = useCompanyNotificationInbox();
  const { permission, requestPermission } = useBrowserNotifications({
    setOpen,
  });

  usePopoverDismiss({ open, containerRef, setOpen });

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
    <div ref={containerRef} className="relative">
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
      {open ? (
        <NotificationInbox
          items={items}
          unreadCount={unreadCount}
          isLoading={isLoading}
          isError={isError}
          markAllPending={markAllPending}
          permission={permission}
          onMarkAllRead={handleMarkAllRead}
          onEnableBrowser={handleEnableBrowser}
          onRetry={retryInbox}
          onOpenItem={handleOpenItem}
        />
      ) : null}
    </div>
  );
}
