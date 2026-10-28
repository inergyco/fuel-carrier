export const formatRecordTimestamp = (value: string, locale: string) =>
  new Date(value).toLocaleString(locale)

export const formatCoordinate = (value: number) => value.toFixed(5)

export const formatSpeed = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)

export function formatMeasure({
  value,
  format,
  unit,
  empty,
}: {
  value: number | undefined
  format: (value: number) => string
  unit: string
  empty: string
}): string {
  if (value == null || !Number.isFinite(value)) {
    return empty
  }

  return `${format(value)} ${unit}`
}
