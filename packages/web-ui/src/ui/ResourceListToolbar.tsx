import { Input } from './Input'

export type ResourceListToolbarProps = {
  searchPlaceholder: string
  searchText: string
  onSearchTextChange: (searchText: string) => void
}

export function ResourceListToolbar({
  searchPlaceholder,
  searchText,
  onSearchTextChange,
}: ResourceListToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <Input
          type="search"
          value={searchText}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-11"
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
      </div>
    </div>
  )
}
