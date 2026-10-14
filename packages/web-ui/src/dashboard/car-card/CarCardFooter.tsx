import type { ReactNode } from "react";

type CarCardFooterProps = {
  detailsLink: ReactNode;
  actions?: ReactNode;
};

export function CarCardFooter({ detailsLink, actions }: CarCardFooterProps) {
  return (
    <div className="relative z-10 mt-auto flex items-end justify-between px-4 pb-4 pt-3">
      <div className="absolute bottom-4 -start-2.75 h-16 w-28 ltr:rotate-y-180">
        <img
          src="/truck-card.png"
          alt=""
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
      <div className="relative h-16 w-1 shrink-0" />
      <div className="flex min-w-0 flex-col items-end gap-4 w-full">
        {actions}
        {detailsLink}
      </div>
    </div>
  );
}
