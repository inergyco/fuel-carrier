import { useRef } from 'react'

const COMPANY_PALETTE = [
  'hsl(199 92% 58%)',
  'hsl(152 66% 45%)',
  'hsl(38 92% 55%)',
  'hsl(271 76% 64%)',
  'hsl(350 80% 62%)',
  'hsl(187 78% 42%)',
  'hsl(16 90% 58%)',
  'hsl(84 60% 45%)',
  'hsl(226 80% 64%)',
  'hsl(320 72% 58%)',
  'hsl(48 90% 50%)',
  'hsl(168 70% 40%)',
] as const

const GOLDEN_ANGLE_DEGREES = 137.508

export function assignCompanyColors(
  companyIds: readonly string[],
  previous: ReadonlyMap<string, string> = new Map(),
): Map<string, string> {
  const next = new Map(previous)

  for (const companyId of companyIds) {
    if (next.has(companyId)) {
      continue
    }

    next.set(companyId, nextAvailableColor(next))
  }

  return next
}

export function useCompanyColors(
  companyIds: readonly string[],
): Map<string, string> {
  const previousRef = useRef(new Map<string, string>())
  previousRef.current = assignCompanyColors(companyIds, previousRef.current)
  return previousRef.current
}

function nextAvailableColor(assigned: ReadonlyMap<string, string>): string {
  const used = new Set(assigned.values())

  for (const color of COMPANY_PALETTE) {
    if (!used.has(color)) {
      return color
    }
  }

  const hue = Math.round((assigned.size * GOLDEN_ANGLE_DEGREES) % 360)
  return `hsl(${hue} 72% 56%)`
}
