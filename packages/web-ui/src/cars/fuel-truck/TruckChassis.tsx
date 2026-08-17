import {
  AXLE_Y,
  CAB_END_X,
  CHASSIS_BOTTOM,
  CHASSIS_TOP,
  STEER_WHEEL,
  TRAILER_WHEEL,
} from './layout'
import { Wheel } from './Wheel'

interface TruckChassisProps {
  chassisGradientId: string
}

export function TruckChassis({ chassisGradientId }: TruckChassisProps) {
  return (
    <g>
      <ellipse
        cx="360"
        cy="258"
        rx="310"
        ry="9"
        className="fill-base-content/8"
      />

      <path
        d={`M30 ${CHASSIS_TOP} H${CAB_END_X - 8} Q${CAB_END_X - 2} ${CHASSIS_TOP} ${CAB_END_X} ${CHASSIS_TOP + 6} H662 Q674 ${CHASSIS_TOP + 6} 674 ${CHASSIS_TOP + 14} V${CHASSIS_BOTTOM - 2} Q674 ${CHASSIS_BOTTOM} 662 ${CHASSIS_BOTTOM} H36 Q24 ${CHASSIS_BOTTOM} 24 ${CHASSIS_BOTTOM - 2} V${CHASSIS_TOP + 8} Q24 ${CHASSIS_TOP} 30 ${CHASSIS_TOP} Z`}
        fill={`url(#${chassisGradientId})`}
        className="stroke-base-content/35"
        strokeWidth={1.5}
      />

      <rect
        x={STEER_WHEEL.cx - 4}
        y={CHASSIS_TOP + 6}
        width={8}
        height={AXLE_Y - CHASSIS_TOP - 6}
        rx={2}
        className="fill-base-content/45"
      />
      <rect
        x={TRAILER_WHEEL.cx - 4}
        y={CHASSIS_TOP + 6}
        width={8}
        height={AXLE_Y - CHASSIS_TOP - 6}
        rx={2}
        className="fill-base-content/45"
      />

      <Wheel cx={STEER_WHEEL.cx} r={STEER_WHEEL.r} />
      <Wheel cx={TRAILER_WHEEL.cx} r={TRAILER_WHEEL.r} />
    </g>
  )
}
