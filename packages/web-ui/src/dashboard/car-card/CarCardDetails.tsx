import { Fuel, Phone, User } from '../../icons'
import { CarCardMetaRow } from './CarCardMetaRow'

type CarCardDetailsProps = {
  driverName: string
  mobileNumber: string
  fuelTypeLabel: string
}

export function CarCardDetails({
  driverName,
  mobileNumber,
  fuelTypeLabel,
}: CarCardDetailsProps) {
  return (
    <div className="relative z-10 flex flex-col gap-2.5 text-sm text-base-content/60">
      <CarCardMetaRow icon={User} label={driverName} />
      <CarCardMetaRow
        icon={Phone}
        label={mobileNumber}
        valueClassName="font-mono tabular-nums font-normal"
      />

      <CarCardMetaRow
        icon={Fuel}
        label={fuelTypeLabel}
        valueClassName="font-normal"
      />
    </div>
  )
}
