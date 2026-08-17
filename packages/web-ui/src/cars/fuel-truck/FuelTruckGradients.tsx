interface FuelTruckGradientsProps {
  chassisGradientId: string
}

export function FuelTruckGradients({
  chassisGradientId,
}: FuelTruckGradientsProps) {
  return (
    <linearGradient id={chassisGradientId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
      <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
    </linearGradient>
  )
}
