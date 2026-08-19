import {
  formatVolume,
  getVisibleTankSlots,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from "./layout";

export type FuelTankLabelsProps = {
  filled: number[];
  unitLabel?: string;
};

export function FuelTankLabels({ filled, unitLabel }: FuelTankLabelsProps) {
  const slots = getVisibleTankSlots(filled);

  if (slots.length === 0) {
    return null;
  }

  return (
    <ul className="pointer-events-none absolute inset-0">
      {slots.map(function renderLabel(slot) {
        const leftPercent = (slot.cx / VIEWBOX_WIDTH) * 100;
        const topPercent = ((slot.cy - slot.r) / VIEWBOX_HEIGHT) * 100;
        const label = `${formatVolume(slot.filled)}${unitLabel ? ` ${unitLabel}` : ""}`;

        return (
          <li
            key={`tank-label-${slot.index}`}
            className="absolute -translate-x-1/2 -translate-y-full pb-1 text-center"
            style={{ left: `${leftPercent}%`, top: `${topPercent + -2.5}%` }}
          >
            <p className="text-[8px] sm:text-xs leading-tight font-medium whitespace-nowrap tabular-nums text-base-content/75">
              {label}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
