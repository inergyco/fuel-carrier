import type { ReactNode } from 'react'

type CarCardFooterProps = {
  detailsLink: ReactNode
}

export function CarCardFooter({ detailsLink }: CarCardFooterProps) {
  return (
    <div className="relative z-10 mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
      <div className="relative h-16 w-28 shrink-0">
        <img
          src="/truck-card.png"
          alt=""
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
      {detailsLink}
    </div>
  )
}
