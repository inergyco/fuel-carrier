import { cn } from '../utils'

type SkeletonProps = {
  className?: string
}

/** DaisyUI pulse bar for loading placeholders. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-md', className)} aria-hidden />
}
