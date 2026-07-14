interface FuelTruckGradientsProps {
  metalGradientId: string
  liquidGradientId: string
  shineGradientId: string
  chassisGradientId: string
}

export function FuelTruckGradients({
  metalGradientId,
  liquidGradientId,
  shineGradientId,
  chassisGradientId,
}: FuelTruckGradientsProps) {
  return (
    <defs>
      <linearGradient id={metalGradientId} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
        <stop offset="35%" stopColor="currentColor" stopOpacity="0.06" />
        <stop offset="70%" stopColor="currentColor" stopOpacity="0.14" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
      </linearGradient>
      <linearGradient id={liquidGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          className="[stop-color:var(--color-primary)]"
          stopOpacity="0.55"
        />
        <stop
          offset="100%"
          className="[stop-color:var(--color-primary)]"
          stopOpacity="0.9"
        />
      </linearGradient>
      <linearGradient id={shineGradientId} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity="0.35" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={chassisGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
      </linearGradient>
    </defs>
  )
}
