import {
  BODY_BOTTOM,
  BODY_TOP,
  CAB_END_X,
  FRONT_BOX,
  MIDDLE_BOX,
  REAR_BOX,
  TRAILER_WHEEL,
} from './layout'

export function TruckBody() {
  return (
    <g>
      {/* Front utility box */}
      <rect
        x={FRONT_BOX.left}
        y={BODY_TOP}
        width={FRONT_BOX.right - FRONT_BOX.left}
        height={BODY_BOTTOM - BODY_TOP}
        className="fill-base-200/90 stroke-base-content/30"
        strokeWidth={1.5}
      />
      <line
        x1={FRONT_BOX.left}
        y1={BODY_TOP}
        x2={FRONT_BOX.left}
        y2={BODY_BOTTOM}
        className="stroke-base-content/25"
        strokeWidth={2}
      />
      <rect
        x={FRONT_BOX.left + 28}
        y={BODY_TOP + (BODY_BOTTOM - BODY_TOP) / 2 - 10}
        width={14}
        height={20}
        rx={2}
        className="fill-base-content/20 stroke-base-content/35"
        strokeWidth={1}
      />
      <line
        x1={FRONT_BOX.left + 35}
        y1={BODY_TOP + (BODY_BOTTOM - BODY_TOP) / 2 - 4}
        x2={FRONT_BOX.left + 35}
        y2={BODY_TOP + (BODY_BOTTOM - BODY_TOP) / 2 + 4}
        className="stroke-base-content/45"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Middle tank enclosure — light fill so tanks stay readable on top */}
      <rect
        x={MIDDLE_BOX.left}
        y={BODY_TOP}
        width={MIDDLE_BOX.right - MIDDLE_BOX.left}
        height={BODY_BOTTOM - BODY_TOP}
        className="fill-base-100/40 stroke-base-content/30"
        strokeWidth={1.5}
      />
      <line
        x1={(MIDDLE_BOX.left + MIDDLE_BOX.right) / 2}
        y1={BODY_TOP + 4}
        x2={(MIDDLE_BOX.left + MIDDLE_BOX.right) / 2}
        y2={BODY_BOTTOM - 4}
        className="stroke-base-content/15"
        strokeWidth={1.5}
      />

      {/* Rear equipment box — roll-up shutter with hazard tape (matches real carrier) */}
      <RearEquipmentBox />

      {/* Body sill connecting sections */}
      <rect
        x={CAB_END_X}
        y={BODY_BOTTOM - 3}
        width={REAR_BOX.right - CAB_END_X}
        height={4}
        className="fill-base-content/20"
      />

      {/* Section dividers */}
      <line
        x1={FRONT_BOX.right}
        y1={BODY_TOP}
        x2={FRONT_BOX.right}
        y2={BODY_BOTTOM}
        className="stroke-base-content/30"
        strokeWidth={2}
      />
      <line
        x1={MIDDLE_BOX.right}
        y1={BODY_TOP}
        x2={MIDDLE_BOX.right}
        y2={BODY_BOTTOM}
        className="stroke-base-content/30"
        strokeWidth={2}
      />

      {/* Rear wheel arch */}
      <path
        d={`
          M ${TRAILER_WHEEL.cx - TRAILER_WHEEL.r - 10} ${BODY_BOTTOM}
          A ${TRAILER_WHEEL.r + 12} ${TRAILER_WHEEL.r + 12} 0 0 1 ${TRAILER_WHEEL.cx + TRAILER_WHEEL.r + 10} ${BODY_BOTTOM}
        `}
        className="fill-none stroke-base-content/25"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Side reflectors */}
      <rect
        x={FRONT_BOX.left + 10}
        y={BODY_BOTTOM - 18}
        width={10}
        height={5}
        rx={1}
        className="fill-warning/70"
      />
      <rect
        x={MIDDLE_BOX.left + 14}
        y={BODY_BOTTOM - 18}
        width={10}
        height={5}
        rx={1}
        className="fill-warning/70"
      />
    </g>
  )
}

const HAZARD_RED = '#dc2626'
const HAZARD_WHITE = '#f8fafc'
const SHUTTER_SLAT = '#ffffff'
const SHUTTER_LINE = '#94a3b8'

function RearEquipmentBox() {
  const boxLeft = REAR_BOX.left
  const boxRight = REAR_BOX.right
  const boxWidth = boxRight - boxLeft
  const tapeHeight = 10
  const shutterLeft = boxLeft + 10
  const shutterRight = boxRight - 10
  const shutterWidth = shutterRight - shutterLeft
  const shutterTop = BODY_TOP + tapeHeight + 6
  const shutterBottom = BODY_BOTTOM - tapeHeight - 6
  const shutterHeight = shutterBottom - shutterTop
  const slatCount = 16
  const slatGap = shutterHeight / slatCount
  const stripeWidth = 10
  const stripeCount = Math.ceil(boxWidth / stripeWidth) + 2

  return (
    <g data-rear-equipment="">
      {/* Panel body */}
      <rect
        x={boxLeft}
        y={BODY_TOP}
        width={boxWidth}
        height={BODY_BOTTOM - BODY_TOP}
        className="fill-base-100/40"
        stroke="#94a3b8"
        strokeWidth={1.5}
      />

      {/* Top red/white diagonal hazard tape */}
      <HazardTape
        x={boxLeft}
        y={BODY_TOP}
        width={boxWidth}
        height={tapeHeight}
        stripeWidth={stripeWidth}
        stripeCount={stripeCount}
      />

      {/* Bottom red/white diagonal hazard tape */}
      <HazardTape
        x={boxLeft}
        y={BODY_BOTTOM - tapeHeight}
        width={boxWidth}
        height={tapeHeight}
        stripeWidth={stripeWidth}
        stripeCount={stripeCount}
      />

      {/* Recessed shutter frame */}
      <rect
        x={shutterLeft - 2}
        y={shutterTop - 2}
        width={shutterWidth + 4}
        height={shutterHeight + 4}
        fill="#d6d3cd"
        stroke="#64748b"
        strokeWidth={1}
        rx={1}
      />

      {/* Roll-up shutter face */}
      <rect
        x={shutterLeft}
        y={shutterTop}
        width={shutterWidth}
        height={shutterHeight}
        fill={SHUTTER_SLAT}
        stroke="#64748b"
        strokeWidth={1}
      />

      {Array.from(
        { length: slatCount },
        function shutterSlat(_: unknown, index: number) {
          const y = shutterTop + index * slatGap;
          return (
            <line
              key={`shutter-slat-${index}`}
              x1={shutterLeft + 1}
              y1={y}
              x2={shutterRight - 1}
              y2={y}
              stroke={SHUTTER_LINE}
              strokeWidth={1}
            />
          );
        },
      )}

      {/* Bottom latch bar */}
      <rect
        x={shutterLeft + 4}
        y={shutterBottom - 10}
        width={shutterWidth - 8}
        height={7}
        rx={1}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1}
      />
      {/* Latch brackets */}
      <rect
        x={shutterLeft + shutterWidth * 0.32}
        y={shutterBottom - 12}
        width={5}
        height={11}
        rx={0.5}
        fill="#1e293b"
      />
      <rect
        x={shutterLeft + shutterWidth * 0.62}
        y={shutterBottom - 12}
        width={5}
        height={11}
        rx={0.5}
        fill="#1e293b"
      />
      <rect
        x={shutterLeft + 2}
        y={shutterBottom - 11}
        width={4}
        height={9}
        rx={0.5}
        fill="#1e293b"
      />
      <rect
        x={shutterRight - 6}
        y={shutterBottom - 11}
        width={4}
        height={9}
        rx={0.5}
        fill="#1e293b"
      />
    </g>
  );
}

type HazardTapeProps = {
  x: number
  y: number
  width: number
  height: number
  stripeWidth: number
  stripeCount: number
}

/** Red/white diagonal chevron hazard strip, matching the real carrier tape. */
function HazardTape({
  x,
  y,
  width,
  height,
  stripeWidth,
  stripeCount,
}: HazardTapeProps) {
  const clipId = `hazard-tape-${x}-${y}`

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={HAZARD_WHITE} />
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: stripeCount }, function stripe(_: unknown, index: number) {
          const sx = x - stripeWidth + index * stripeWidth
          return (
            <polygon
              key={`hazard-${y}-${index}`}
              points={`${sx},${y} ${sx + stripeWidth / 2},${y} ${sx + stripeWidth},${y + height} ${sx + stripeWidth / 2},${y + height}`}
              fill={index % 2 === 0 ? HAZARD_RED : HAZARD_WHITE}
            />
          )
        })}
      </g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#64748b"
        strokeWidth={0.75}
      />
    </g>
  )
}
