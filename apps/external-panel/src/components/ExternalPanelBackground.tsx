interface ExternalPanelBackgroundProps {
  variant?: 'auth' | 'shell'
}

export function ExternalPanelBackground({
  variant = 'auth',
}: ExternalPanelBackgroundProps) {
  const isShell = variant === 'shell'

  return (
    <>
      <div
        aria-hidden
        className={
          isShell
            ? 'pointer-events-none absolute inset-0 bg-[url("/auth-bg.png")] bg-contain bg-center bg-no-repeat opacity-35 dark:opacity-25'
            : 'pointer-events-none absolute inset-0 bg-[url("/auth-bg.png")] bg-contain bg-bottom bg-no-repeat opacity-[0.18] dark:opacity-[0.12]'
        }
      />
      <div
        aria-hidden
        className={
          isShell
            ? 'pointer-events-none absolute inset-0 bg-gradient-to-b from-base-100/25 via-base-100/55 to-base-100/80'
            : 'pointer-events-none absolute inset-0 bg-gradient-to-b from-base-100/60 via-base-100/88 to-base-100'
        }
      />
    </>
  )
}
