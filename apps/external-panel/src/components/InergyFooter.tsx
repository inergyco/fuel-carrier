import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '@fuel-carrier/web-ui/utils'

interface InergyFooterProps {
  className?: string
  stacked?: boolean
}

export function InergyFooter({ className, stacked = false }: InergyFooterProps) {
  const { LL } = useI18nContext()
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'flex items-center justify-center gap-2 px-2 py-3',
        stacked ? 'flex-col' : 'flex-col sm:flex-row sm:gap-3',
        className,
      )}
    >
      <a
        href="https://www.inergy.ir"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
      >
        <img
          src="/inergy-logo.png"
          alt="Inergy"
          className="h-9 w-auto max-w-40 object-contain sm:h-10 sm:max-w-44"
        />
      </a>
      <p className="text-center text-[10px] leading-snug text-base-content/35 sm:text-xs">
        {LL.externalPanel.footer.copyright({ year })}
      </p>
    </footer>
  )
}
