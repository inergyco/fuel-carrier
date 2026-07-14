import { CHASSIS_BOTTOM, CHASSIS_TOP, STEER_WHEEL } from './layout'

export function TruckCab() {
  return (
    <g>
      <path
        d={`M24 188 V${CHASSIS_BOTTOM - 4} Q24 ${CHASSIS_BOTTOM} 32 ${CHASSIS_BOTTOM} H46 V188 Q46 180 38 180 H32 Q24 180 24 188 Z`}
        className="fill-base-content/50 stroke-base-content/35"
        strokeWidth={1.5}
      />
      <line
        x1="30"
        y1="194"
        x2="30"
        y2="218"
        className="stroke-base-content/25"
        strokeWidth={2}
      />
      <line
        x1="36"
        y1="194"
        x2="36"
        y2="218"
        className="stroke-base-content/25"
        strokeWidth={2}
      />
      <ellipse
        cx="36"
        cy="200"
        rx="5"
        ry="7"
        className="fill-primary/35 stroke-base-content/25"
        strokeWidth={1}
      />

      <path
        d={`
          M46 148
          Q46 134 62 134
          H118
          V${CHASSIS_TOP}
          H${STEER_WHEEL.cx + STEER_WHEEL.r + 6}
          A ${STEER_WHEEL.r + 10} ${STEER_WHEEL.r + 10} 0 0 0 ${STEER_WHEEL.cx - STEER_WHEEL.r - 6} ${CHASSIS_TOP}
          H46
          Z
        `}
        className="fill-base-200 stroke-base-content/35"
        strokeWidth={2}
      />

      <path
        d={`M118 ${CHASSIS_TOP} V100 Q118 80 138 80 H190 Q210 80 210 102 V${CHASSIS_TOP} Z`}
        className="fill-base-200/95 stroke-base-content/35"
        strokeWidth={2}
      />

      <path
        d="M132 80 Q144 56 170 56 Q198 56 204 80"
        className="fill-base-300/80 stroke-base-content/30"
        strokeWidth={1.5}
      />

      <path
        d="M134 94 H198 V128 Q198 136 190 136 H142 Q134 136 134 128 Z"
        className="fill-primary/20 stroke-base-content/25"
        strokeWidth={1.5}
      />

      <rect
        x="144"
        y="146"
        width="48"
        height="28"
        rx="3"
        className="fill-primary/15 stroke-base-content/20"
        strokeWidth={1}
      />

      <line
        x1="170"
        y1="136"
        x2="170"
        y2={CHASSIS_TOP}
        className="stroke-base-content/20"
        strokeWidth={1.5}
      />
      <rect
        x="176"
        y="168"
        width="10"
        height="4"
        rx="1"
        className="fill-base-content/35"
      />

      <rect
        x="178"
        y={CHASSIS_TOP}
        width="26"
        height={6}
        rx={1}
        className="fill-base-content/40"
      />
      <rect
        x="182"
        y={CHASSIS_TOP + 6}
        width="22"
        height={5}
        rx={1}
        className="fill-base-content/30"
      />

      <rect
        x="212"
        y="102"
        width="8"
        height="26"
        rx="2"
        className="fill-base-content/40"
      />
      <line
        x1="210"
        y1="112"
        x2="212"
        y2="112"
        className="stroke-base-content/35"
        strokeWidth={2}
      />

      <rect
        x="214"
        y="88"
        width="7"
        height="58"
        rx="2"
        className="fill-base-content/35"
      />

      <path
        d={`
          M ${STEER_WHEEL.cx - STEER_WHEEL.r - 6} ${CHASSIS_TOP}
          A ${STEER_WHEEL.r + 10} ${STEER_WHEEL.r + 10} 0 0 1 ${STEER_WHEEL.cx + STEER_WHEEL.r + 6} ${CHASSIS_TOP}
        `}
        className="fill-none stroke-base-content/40"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={`
          M ${STEER_WHEEL.cx - STEER_WHEEL.r - 2} ${CHASSIS_TOP}
          A ${STEER_WHEEL.r + 6} ${STEER_WHEEL.r + 6} 0 0 1 ${STEER_WHEEL.cx + STEER_WHEEL.r + 2} ${CHASSIS_TOP}
        `}
        className="fill-none stroke-base-200"
        strokeWidth={2}
        strokeLinecap="round"
      />

      <rect
        x="138"
        y={CHASSIS_TOP - 2}
        width="6"
        height={10}
        rx={1}
        className="fill-base-content/45"
      />
      <rect
        x="186"
        y={CHASSIS_TOP - 2}
        width="6"
        height={10}
        rx={1}
        className="fill-base-content/45"
      />
      <ellipse
        cx="164"
        cy={CHASSIS_TOP + 10}
        rx={28}
        ry={13}
        className="fill-base-content/45 stroke-base-content/35"
        strokeWidth={1.5}
      />
      <ellipse
        cx="164"
        cy={CHASSIS_TOP + 7}
        rx={20}
        ry={6}
        className="fill-base-content/15"
      />
    </g>
  )
}
