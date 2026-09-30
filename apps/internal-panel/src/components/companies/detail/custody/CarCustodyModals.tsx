import { CarCustodyPickerSession } from './CarCustodyPickerSession'
import type { CompanyCarCustodyApi } from './useCompanyCarCustody'

type CarCustodyModalsProps = {
  custody: CompanyCarCustodyApi
}

export function CarCustodyModals({ custody }: CarCustodyModalsProps) {
  const target = custody.target
  const pickerTarget =
    target !== null && (target.mode === 'assign' || target.mode === 'change')
      ? { car: target.car, mode: target.mode }
      : null

  if (!pickerTarget) {
    return null
  }

  return (
    <CarCustodyPickerSession
      key={`${pickerTarget.car.id}-${pickerTarget.mode}`}
      car={pickerTarget.car}
      mode={pickerTarget.mode}
      custody={custody}
    />
  )
}
