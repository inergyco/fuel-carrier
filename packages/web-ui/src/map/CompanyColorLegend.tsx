export type CompanyColorLegendItem = {
  companyId: string
  name: string
  color: string
}

type CompanyColorLegendProps = {
  title: string
  items: CompanyColorLegendItem[]
}

export function CompanyColorLegend({ title, items }: CompanyColorLegendProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-1000 flex justify-center p-3 md:bottom-4 md:justify-start md:p-4">
      <aside
        aria-label={title}
        className="pointer-events-auto max-h-40 w-full max-w-xs overflow-y-auto rounded-2xl border border-base-content/8 bg-base-200/70 px-4 py-3 shadow-lg backdrop-blur-xl sm:max-h-52"
      >
        <p className="text-xs font-semibold tracking-tight text-base-content/80">
          {title}
        </p>
        <ul className="mt-2 space-y-1.5">
          {items.map(function renderLegendItem(item) {
            return (
              <li
                key={item.companyId}
                className="flex items-center gap-2 text-xs text-base-content/70"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-2 ring-base-100"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="min-w-0 truncate">{item.name}</span>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}
