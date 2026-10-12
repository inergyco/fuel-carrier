import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import {
  emptyIranianLicensePlateParts,
  isCompleteIranianLicensePlateParts,
  isIranianLicensePlateLetter,
  parseIranianLicensePlate,
  stringifyIranianLicensePlate,
  toLatinDigits,
  type IranianLicensePlateParts,
} from '@fuel-carrier/shared-validation/car/create'

/** Most common private-vehicle letter on Iranian plates. */
const DEFAULT_LETTER = 'ب'

type DigitField = 'left' | 'middle' | 'region'
type FocusField = 'left' | 'letter' | 'middle'

export function useLicensePlateParts(
  value: string,
  onChange: (value: string) => void,
) {
  const leftRef = useRef<HTMLInputElement>(null)
  const letterRef = useRef<HTMLSelectElement>(null)
  const middleRef = useRef<HTMLInputElement>(null)
  const regionRef = useRef<HTMLInputElement>(null)
  const lastEmittedRef = useRef(value)
  const [parts, setParts] = useState<IranianLicensePlateParts>(() =>
    partsFromValue(value),
  )

  useEffect(() => {
    if (value === lastEmittedRef.current) {
      return
    }

    lastEmittedRef.current = value
    setParts(partsFromValue(value))
  }, [value])

  function emitParts(next: IranianLicensePlateParts) {
    setParts(next)
    const serialized = stringifyIranianLicensePlate(next)
    lastEmittedRef.current = serialized
    onChange(serialized)
  }

  function handleDigitChange(
    field: DigitField,
    maxLength: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const digits = toLatinDigits(event.target.value)
      .replace(/\D/g, '')
      .slice(0, maxLength)
    const next = { ...parts, [field]: digits }
    emitParts(next)

    if (digits.length >= maxLength && field !== 'region') {
      focusNext(field)
    }
  }

  function handleLetterChange(event: ChangeEvent<HTMLSelectElement>) {
    const letter = event.target.value
    const next = {
      ...parts,
      letter: isIranianLicensePlateLetter(letter) ? letter : '',
    }
    emitParts(next)

    if (next.letter) {
      focusNext('letter')
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLElement>) {
    const text = event.clipboardData.getData('text')
    const parsed = parseIranianLicensePlate(text)
    if (!parsed || !isCompleteIranianLicensePlateParts(parsed)) {
      return
    }

    event.preventDefault()
    emitParts(parsed)
    regionRef.current?.focus()
  }

  function handleDigitKeyDown(
    field: DigitField,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== 'Backspace' || parts[field].length > 0) {
      return
    }

    event.preventDefault()
    focusPrevious(field)
  }

  function focusNext(field: FocusField) {
    if (field === 'left') {
      letterRef.current?.focus()
      return
    }

    if (field === 'letter') {
      middleRef.current?.focus()
      return
    }

    regionRef.current?.focus()
  }

  function focusPrevious(field: DigitField) {
    if (field === 'middle') {
      letterRef.current?.focus()
      return
    }

    if (field === 'region') {
      middleRef.current?.focus()
      return
    }

    leftRef.current?.focus()
  }

  return {
    parts,
    leftRef,
    letterRef,
    middleRef,
    regionRef,
    handleDigitChange,
    handleLetterChange,
    handlePaste,
    handleDigitKeyDown,
  }
}

function partsFromValue(value: string): IranianLicensePlateParts {
  const parts = parseIranianLicensePlate(value) ?? emptyIranianLicensePlateParts()
  const isEmpty =
    !parts.left && !parts.letter && !parts.middle && !parts.region

  if (!isEmpty) {
    return parts
  }

  return { ...parts, letter: DEFAULT_LETTER }
}
