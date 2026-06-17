import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../utils'

interface LocaleControlsProps {
  className?: string
}

export function LocaleControls({ className }: LocaleControlsProps) {
  return (
    <div className={cn('absolute top-4 end-4 flex items-center gap-1', className)}>
      <LanguageToggle />
      <ThemeToggle />
    </div>
  )
}
