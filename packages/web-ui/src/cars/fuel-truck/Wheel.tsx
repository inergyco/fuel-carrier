import { AXLE_Y } from './layout'

interface WheelProps {
  cx: number
  cy?: number
  r?: number
}

export function Wheel({ cx, cy = AXLE_Y, r = 20 }: WheelProps) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className="fill-base-300 stroke-base-content/50"
        strokeWidth={2.5}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.72}
        className="fill-base-200/90 stroke-base-content/30"
        strokeWidth={1.5}
      />
      {[0, 60, 120].map(function renderSpoke(angle) {
        const rad = (angle * Math.PI) / 180
        return (
          <line
            key={angle}
            x1={cx + Math.cos(rad) * r * 0.22}
            y1={cy + Math.sin(rad) * r * 0.22}
            x2={cx + Math.cos(rad) * r * 0.58}
            y2={cy + Math.sin(rad) * r * 0.58}
            className="stroke-base-content/35"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r * 0.22} className="fill-base-content/45" />
      <circle cx={cx} cy={cy} r={r * 0.1} className="fill-base-content/60" />
    </g>
  )
}
