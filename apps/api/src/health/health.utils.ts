import type { ReadinessResult } from './health.types';

export function formatReadinessFailure(result: ReadinessResult): string {
  return Object.entries(result.checks)
    .filter(([, check]) => check.status === 'down')
    .map(([name, check]) => `${name}: ${check.message ?? 'unavailable'}`)
    .join('; ');
}
