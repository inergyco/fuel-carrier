import { useId } from 'react'
import { CAB_END_X, CHASSIS_TOP, STEER_WHEEL } from './layout'

const CAB_FRONT = 40
const CAB_TOP = 62
/** Clean industrial white — close to the reference cab. */
const CAB_PAINT = '#f7f8fa'
const CAB_PAINT_SHADOW = '#e4e7ec'
const CAB_EDGE = '#94a3b8'
const TRIM_BLACK = '#1a1f26'
const TRIM_SOFT = '#2d3340'

export function TruckCab() {
  const uid = useId().replace(/:/g, '')
  const paintId = `${uid}-cab-paint`
  const glassId = `${uid}-cab-glass`
  const glassShineId = `${uid}-cab-glass-shine`
  const headlightId = `${uid}-cab-headlight`

  const archR = STEER_WHEEL.r + 16
  const archLeft = STEER_WHEEL.cx - archR
  const archRight = STEER_WHEEL.cx + archR

  return (
    <g data-truck-cab="">
      <defs>
        <linearGradient id={paintId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={CAB_PAINT} />
          <stop offset="100%" stopColor={CAB_PAINT_SHADOW} />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b7a96" stopOpacity="0.92" />
          <stop offset="38%" stopColor="#3d5a73" stopOpacity="0.95" />
          <stop offset="72%" stopColor="#2a455c" stopOpacity="0.97" />
          <stop offset="100%" stopColor="#1e3345" />
        </linearGradient>
        <linearGradient id={glassShineId} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={headlightId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e8eef5" />
          <stop offset="100%" stopColor="#c5d0dc" />
        </linearGradient>
      </defs>

      {/* Front bumper skirt */}
      <path
        d={`
          M26 186
          V${CHASSIS_TOP + 4}
          Q26 ${CHASSIS_TOP + 16} 38 ${CHASSIS_TOP + 16}
          H54
          V186
          Q54 176 44 176
          H34
          Q26 176 26 186
          Z
        `}
        fill={TRIM_BLACK}
        stroke={TRIM_SOFT}
        strokeWidth={0.75}
      />

      {/* Main cab body — boxy COE with soft roof radii */}
      <path
        d={`
          M${CAB_FRONT} ${CHASSIS_TOP}
          V${CAB_TOP + 14}
          Q${CAB_FRONT} ${CAB_TOP} ${CAB_FRONT + 12} ${CAB_TOP}
          H${CAB_END_X - 14}
          Q${CAB_END_X} ${CAB_TOP} ${CAB_END_X} ${CAB_TOP + 16}
          V${CHASSIS_TOP}
          H${archRight + 6}
          L${archRight + 6} ${CHASSIS_TOP + 3}
          H${archLeft - 6}
          L${archLeft - 6} ${CHASSIS_TOP}
          H${CAB_FRONT}
          Z
        `}
        fill={`url(#${paintId})`}
        stroke={CAB_EDGE}
        strokeWidth={1.5}
      />

      {/* Subtle door panel crease */}
      <path
        d={`M102 128 H${CAB_END_X - 10}`}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={1}
        strokeLinecap="round"
      />

      {/* Front face / A-pillar volume */}
      <path
        d={`
          M${CAB_FRONT} ${CAB_TOP + 14}
          L${CAB_FRONT + 20} ${CAB_TOP + 10}
          L${CAB_FRONT + 22} ${CHASSIS_TOP}
          H${CAB_FRONT}
          Z
        `}
        fill={CAB_PAINT}
        stroke={CAB_EDGE}
        strokeWidth={1}
      />

      {/* Front windshield wrap (visible from side) */}
      <path
        d={`
          M${CAB_FRONT + 3} ${CAB_TOP + 16}
          L${CAB_FRONT + 18} ${CAB_TOP + 13}
          L${CAB_FRONT + 19} ${CHASSIS_TOP - 78}
          L${CAB_FRONT + 4} ${CHASSIS_TOP - 74}
          Z
        `}
        fill={`url(#${glassId})`}
        stroke="#475569"
        strokeWidth={1}
      />
      <path
        d={`
          M${CAB_FRONT + 5} ${CAB_TOP + 20}
          L${CAB_FRONT + 14} ${CAB_TOP + 18}
          L${CAB_FRONT + 15} ${CAB_TOP + 48}
          L${CAB_FRONT + 6} ${CAB_TOP + 50}
          Z
        `}
        fill={`url(#${glassShineId})`}
      />

      {/* Tall corner headlight */}
      <rect
        x={CAB_FRONT + 2}
        y={CHASSIS_TOP - 70}
        width={11}
        height={56}
        rx={2.5}
        fill={`url(#${headlightId})`}
        stroke="#64748b"
        strokeWidth={1}
      />
      <rect
        x={CAB_FRONT + 4}
        y={CHASSIS_TOP - 66}
        width={3}
        height={48}
        rx={1}
        fill="#ffffff"
        opacity={0.55}
      />

      {/* Door seam */}
      <path
        d={`
          M100 ${CAB_TOP + 10}
          V${CHASSIS_TOP - 2}
        `}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <path
        d={`
          M100 ${CAB_TOP + 10}
          H${CAB_END_X - 6}
        `}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1}
      />

      {/* Main door glass — stepped bottom, slight front rake */}
      <path
        d={`
          M106 78
          H184
          V112
          L152 128
          H112
          L106 118
          Z
        `}
        fill={`url(#${glassId})`}
        stroke="#334155"
        strokeWidth={1.5}
      />
      {/* Black rubber seal inset */}
      <path
        d={`
          M108.5 80.5
          H181.5
          V110.5
          L151 125.5
          H114
          L108.5 116.5
          Z
        `}
        fill="none"
        stroke="#0f172a"
        strokeWidth={1.25}
        opacity={0.35}
      />
      {/* Specular reflection band */}
      <path
        d={`
          M112 82
          H138
          L132 118
          H114
          L112 112
          Z
        `}
        fill={`url(#${glassShineId})`}
      />
      <path
        d={`
          M148 84
          H168
          L164 108
          H146
          Z
        `}
        fill="#ffffff"
        opacity={0.08}
      />

      {/* Rear quarter window */}
      <rect
        x={188}
        y={74}
        width={11}
        height={30}
        rx={2}
        fill={`url(#${glassId})`}
        stroke="#334155"
        strokeWidth={1.25}
      />
      <rect
        x={189.5}
        y={76}
        width={4}
        height={16}
        rx={1}
        fill={`url(#${glassShineId})`}
      />

      {/* Vertical door handle */}
      <rect
        x={182}
        y={134}
        width={7}
        height={24}
        rx={1.5}
        fill={TRIM_BLACK}
      />
      <rect
        x={183.5}
        y={136}
        width={2}
        height={20}
        rx={0.5}
        fill="#4a5568"
      />

      {/* Lower door step / sill line */}
      <path
        d={`M102 ${CHASSIS_TOP - 12} H${CAB_END_X - 8}`}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={1.25}
        strokeLinecap="round"
      />

      {/* Side mirror — large COE-style unit */}
      <path
        d="M104 86 C98 84 94 86 90 90 L88 108 C92 112 98 110 104 106 Z"
        fill={TRIM_BLACK}
      />
      <rect
        x={86}
        y={78}
        width={12}
        height={22}
        rx={2}
        fill={TRIM_BLACK}
        stroke="#475569"
        strokeWidth={0.75}
      />
      <rect
        x={88}
        y={80}
        width={5}
        height={16}
        rx={1}
        fill="#64748b"
        opacity={0.55}
      />

      {/* Black plastic wheel-arch flare */}
      <path
        d={`
          M${archLeft - 8} ${CHASSIS_TOP + 3}
          Q${archLeft - 8} ${CHASSIS_TOP - archR + 10} ${STEER_WHEEL.cx} ${CHASSIS_TOP - archR + 8}
          Q${archRight + 8} ${CHASSIS_TOP - archR + 10} ${archRight + 8} ${CHASSIS_TOP + 3}
          L${archRight + 3} ${CHASSIS_TOP + 8}
          Q${STEER_WHEEL.cx} ${CHASSIS_TOP - archR + 18} ${archLeft - 3} ${CHASSIS_TOP + 8}
          Z
        `}
        fill={TRIM_BLACK}
      />
      {/* Soft highlight on arch lip */}
      <path
        d={`
          M${archLeft - 4} ${CHASSIS_TOP + 1}
          Q${STEER_WHEEL.cx} ${CHASSIS_TOP - archR + 12} ${archRight + 4} ${CHASSIS_TOP + 1}
        `}
        fill="none"
        stroke="#4b5563"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Entry step behind wheel */}
      <path
        d={`
          M${archRight + 4} ${CHASSIS_TOP + 2}
          H${CAB_END_X - 4}
          V${CHASSIS_TOP + 12}
          H${archRight + 10}
          Q${archRight + 4} ${CHASSIS_TOP + 12} ${archRight + 4} ${CHASSIS_TOP + 2}
          Z
        `}
        fill={TRIM_SOFT}
        opacity={0.85}
      />
    </g>
  )
}
