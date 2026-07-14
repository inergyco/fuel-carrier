import {
  AXLE_Y,
  CHASSIS_BOTTOM,
  CHASSIS_TOP,
  DECK_TOP,
  STEER_WHEEL,
  TRAILER_WHEEL_R,
} from './layout'
import { Wheel } from './Wheel'

interface TruckChassisProps {
  chassisGradientId: string
}

export function TruckChassis({ chassisGradientId }: TruckChassisProps) {
  return (
    <g>
      <ellipse
        cx="380"
        cy="258"
        rx="300"
        ry="9"
        className="fill-base-content/8"
      />

      <path
        d={`M34 ${CHASSIS_TOP} H670 Q682 ${CHASSIS_TOP} 682 ${CHASSIS_TOP + 8} V${CHASSIS_BOTTOM - 2} Q682 ${CHASSIS_BOTTOM} 670 ${CHASSIS_BOTTOM} H40 Q28 ${CHASSIS_BOTTOM} 28 ${CHASSIS_BOTTOM - 2} V${CHASSIS_TOP + 8} Q28 ${CHASSIS_TOP} 34 ${CHASSIS_TOP} Z`}
        fill={`url(#${chassisGradientId})`}
        className="stroke-base-content/35"
        strokeWidth={1.5}
      />
      <rect
        x="40"
        y={CHASSIS_TOP + 4}
        width="630"
        height={3}
        rx={1}
        className="fill-base-content/15"
      />

      <rect
        x={STEER_WHEEL.cx - 4}
        y={CHASSIS_TOP + 6}
        width={8}
        height={AXLE_Y - CHASSIS_TOP - 6}
        rx={2}
        className="fill-base-content/45"
      />

      <Wheel cx={STEER_WHEEL.cx} r={STEER_WHEEL.r} />
      <Wheel cx={268} r={TRAILER_WHEEL_R} />
      <Wheel cx={560} r={TRAILER_WHEEL_R} />
      <Wheel cx={602} r={TRAILER_WHEEL_R} />
      <Wheel cx={644} r={TRAILER_WHEEL_R} />

      <rect
        x="230"
        y={DECK_TOP}
        width="440"
        height={28}
        rx={4}
        className="fill-base-content/30 stroke-base-content/25"
        strokeWidth={1}
      />
      <rect
        x="234"
        y={DECK_TOP + 4}
        width="432"
        height={4}
        rx={1}
        className="fill-base-content/12"
      />

      <rect
        x="210"
        y={DECK_TOP - 2}
        width={36}
        height={14}
        rx={2}
        className="fill-base-content/45 stroke-base-content/30"
        strokeWidth={1}
      />

      {/* <g className="stroke-base-content/40" strokeWidth={2}>
        <line x1="250" y1={CHASSIS_BOTTOM} x2="250" y2={AXLE_Y + 8} />
        <line x1="262" y1={CHASSIS_BOTTOM} x2="262" y2={AXLE_Y + 8} />
        <line x1="244" y1={AXLE_Y + 8} x2="268" y2={AXLE_Y + 8} />
      </g> */}
    </g>
  )
}
