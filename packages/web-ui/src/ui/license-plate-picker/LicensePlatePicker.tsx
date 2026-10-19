import { cn } from "../../utils";
import { Field } from "../Field";
import { useFieldIds } from "../useFieldIds";
import { IranPlateRegion } from "./IranPlateRegion";
import { IranPlateStripe } from "./IranPlateStripe";
import { PlateDigitInput } from "./PlateDigitInput";
import { PlateLetterSelect } from "./PlateLetterSelect";
import { useLicensePlateParts } from "./useLicensePlateParts";

type LicensePlatePickerProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

export function LicensePlatePicker({
  label,
  error,
  value,
  onChange,
  onBlur,
  disabled = false,
  className,
  id: idProp,
  name,
}: LicensePlatePickerProps) {
  const { id, errorId } = useFieldIds({ id: idProp, error });
  const plate = useLicensePlateParts(value, onChange);

  return (
    <Field label={label} error={error} htmlFor={id} errorId={errorId}>
      <div className={cn("w-full", className)}>
        {name ? (
          <input type="hidden" name={name} value={value} readOnly />
        ) : null}
        <div
          dir="ltr"
          onBlur={onBlur}
          className={cn(
            "flex h-14 overflow-hidden rounded-md border border-base-content/10 bg-panel-card text-neutral-900 sm:h-16",
            error && "border-error",
            disabled && "opacity-60",
          )}
        >
          <IranPlateStripe />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1.5 sm:gap-2 sm:px-2.5">
            <PlateDigitInput
              ref={plate.leftRef}
              id={id}
              ariaLabel="Two-digit series"
              value={plate.parts.left}
              maxLength={2}
              disabled={disabled}
              errorId={errorId}
              onChange={(event) => plate.handleDigitChange("left", 2, event)}
              onKeyDown={(event) => plate.handleDigitKeyDown("left", event)}
              onPaste={plate.handlePaste}
              className="flex-[2]"
            />

            <PlateLetterSelect
              ref={plate.letterRef}
              value={plate.parts.letter}
              disabled={disabled}
              onChange={plate.handleLetterChange}
              onPaste={plate.handlePaste}
              className="flex-[1.5]"
            />

            <PlateDigitInput
              ref={plate.middleRef}
              ariaLabel="Three-digit serial"
              value={plate.parts.middle}
              maxLength={3}
              disabled={disabled}
              onChange={(event) => plate.handleDigitChange("middle", 3, event)}
              onKeyDown={(event) => plate.handleDigitKeyDown("middle", event)}
              onPaste={plate.handlePaste}
              className="flex-[3]"
            />
          </div>

          <IranPlateRegion
            regionRef={plate.regionRef}
            value={plate.parts.region}
            disabled={disabled}
            onChange={(event) => plate.handleDigitChange("region", 2, event)}
            onKeyDown={(event) => plate.handleDigitKeyDown("region", event)}
            onPaste={plate.handlePaste}
          />
        </div>
      </div>
    </Field>
  );
}
