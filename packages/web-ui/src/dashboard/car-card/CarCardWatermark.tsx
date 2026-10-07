import { getFuelLevelColor } from "../../map";

type CarCardWatermarkProps = {
  fillPercent: number | null;
  remainFuel: number | null;
};

export function CarCardWatermark({
  fillPercent,
  remainFuel,
}: CarCardWatermarkProps) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute end-4 top-1/4 z-0 -translate-y-1/2 select-none text-[7rem] font-semibold leading-none tracking-tighter tabular-nums opacity-30"
      style={{
        color:
          remainFuel != null
            ? getFuelLevelColor(remainFuel)
            : "base-content/30",
      }}
    >
      {fillPercent != null ? `${fillPercent}%` : "?"}
    </span>
  );
}
