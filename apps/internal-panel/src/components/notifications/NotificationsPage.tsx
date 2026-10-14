import { useState } from "react";
import { NotificationHistory } from "./NotificationHistory";
import { SendNotificationForm } from "./SendNotificationForm";

export function NotificationsPage() {
  const [historyVersion, setHistoryVersion] = useState(0);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <SendNotificationForm
        onSent={() => setHistoryVersion((version) => version + 1)}
      />
      <NotificationHistory key={historyVersion} />
    </div>
  );
}
