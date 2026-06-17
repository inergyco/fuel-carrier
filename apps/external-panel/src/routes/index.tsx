import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LocaleControls } from '@fuel-carrier/web-ui/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { LL } = useI18nContext()

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <LocaleControls />
      <h1 className="text-3xl font-bold">{LL.externalPanel.home.title()}</h1>
      <p className="text-base-content/70">{LL.externalPanel.home.description()}</p>
    </main>
  )
}
