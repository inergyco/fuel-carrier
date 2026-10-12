/** Digits as shown on Iranian plates (Eastern Arabic / Persian). */
const PERSIAN_DIGIT_OFFSET = 0x06f0;
const ARABIC_INDIC_DIGIT_OFFSET = 0x0660;

/**
 * Letters used on standard Iranian passenger plates.
 * "الف" is the plate form of ا.
 */
export const IRANIAN_LICENSE_PLATE_LETTERS = [
  'الف',
  'ب',
  'پ',
  'ت',
  'ث',
  'ج',
  'د',
  'ز',
  'س',
  'ش',
  'ص',
  'ط',
  'ع',
  'ف',
  'ق',
  'ک',
  'گ',
  'ل',
  'م',
  'ن',
  'و',
  'ه',
  'ی',
] as const;

export type IranianLicensePlateLetter =
  (typeof IRANIAN_LICENSE_PLATE_LETTERS)[number];

export type IranianLicensePlateParts = {
  /** Two digits, Latin 0-9 for editing. */
  left: string;
  letter: string;
  /** Three digits, Latin 0-9 for editing. */
  middle: string;
  /** City/province code, two digits, Latin 0-9 for editing. */
  region: string;
};

const LETTER_ALTERNATION = IRANIAN_LICENSE_PLATE_LETTERS.join('|');

/** Canonical stored form after digit normalization: `۱۲ب۳۴۵-۶۷`. */
export const IRANIAN_LICENSE_PLATE_PATTERN = new RegExp(
  `^[\\u06F0-\\u06F9]{2}(?:${LETTER_ALTERNATION})[\\u06F0-\\u06F9]{3}-[\\u06F0-\\u06F9]{2}$`,
);

const COMPLETE_PARSE_PATTERN = new RegExp(
  `^([0-9\\u06F0-\\u06F9٠-٩]{2})\\s*(${LETTER_ALTERNATION}|[اأآ])\\s*([0-9\\u06F0-\\u06F9٠-٩]{3})\\s*-\\s*([0-9\\u06F0-\\u06F9٠-٩]{2})$`,
);

/** In-progress editor encoding: `12:ب:345:67` (Latin digits). */
const EDITING_PARSE_PATTERN = /^(\d{0,2}):([^:]*):(\d{0,3}):(\d{0,2})$/;

export function toPersianDigits(value: string): string {
  return value.replace(/[0-9٠-٩]/g, (digit) => {
    if (digit >= '0' && digit <= '9') {
      return String.fromCharCode(PERSIAN_DIGIT_OFFSET + Number(digit));
    }

    return String.fromCharCode(
      PERSIAN_DIGIT_OFFSET + (digit.charCodeAt(0) - ARABIC_INDIC_DIGIT_OFFSET),
    );
  });
}

export function toLatinDigits(value: string): string {
  return value.replace(/[\u06F0-\u06F9٠-٩]/g, (digit) => {
    if (digit >= '٠' && digit <= '٩') {
      return String(digit.charCodeAt(0) - ARABIC_INDIC_DIGIT_OFFSET);
    }

    return String(digit.charCodeAt(0) - PERSIAN_DIGIT_OFFSET);
  });
}

export function normalizeIranianLicensePlateLetter(raw: string): string {
  const letter = raw
    .replaceAll('ك', 'ک')
    .replaceAll('ي', 'ی')
    .replaceAll('ة', 'ه')
    .trim();

  if (letter === 'ا' || letter === 'أ' || letter === 'آ') {
    return 'الف';
  }

  return letter;
}

export function isIranianLicensePlateLetter(
  letter: string,
): letter is IranianLicensePlateLetter {
  return (IRANIAN_LICENSE_PLATE_LETTERS as readonly string[]).includes(letter);
}

export function emptyIranianLicensePlateParts(): IranianLicensePlateParts {
  return { left: '', letter: '', middle: '', region: '' };
}

export function hasIranianLicensePlateParts(
  parts: IranianLicensePlateParts,
): boolean {
  return Boolean(parts.left || parts.letter || parts.middle || parts.region);
}

export function isCompleteIranianLicensePlateParts(
  parts: IranianLicensePlateParts,
): boolean {
  return (
    /^\d{2}$/.test(parts.left) &&
    isIranianLicensePlateLetter(parts.letter) &&
    /^\d{3}$/.test(parts.middle) &&
    /^\d{2}$/.test(parts.region)
  );
}

/**
 * Serialize parts. Complete plates use the canonical Persian form (`۱۲ب۳۴۵-۶۷`);
 * in-progress values use a colon-separated editing form so the picker can
 * round-trip without wiping partial input.
 */
export function stringifyIranianLicensePlate(
  parts: IranianLicensePlateParts,
): string {
  const letter = normalizeIranianLicensePlateLetter(parts.letter);
  const normalized: IranianLicensePlateParts = {
    left: toLatinDigits(parts.left).replace(/\D/g, '').slice(0, 2),
    letter: isIranianLicensePlateLetter(letter) ? letter : '',
    middle: toLatinDigits(parts.middle).replace(/\D/g, '').slice(0, 3),
    region: toLatinDigits(parts.region).replace(/\D/g, '').slice(0, 2),
  };

  if (!hasIranianLicensePlateParts(normalized)) {
    return '';
  }

  if (isCompleteIranianLicensePlateParts(normalized)) {
    return `${toPersianDigits(normalized.left)}${normalized.letter}${toPersianDigits(normalized.middle)}-${toPersianDigits(normalized.region)}`;
  }

  return `${normalized.left}:${normalized.letter}:${normalized.middle}:${normalized.region}`;
}

export function parseIranianLicensePlate(
  value: string,
): IranianLicensePlateParts | null {
  const trimmed = value.trim().replaceAll(/\s+/g, '');
  if (!trimmed) {
    return emptyIranianLicensePlateParts();
  }

  const editingMatch = EDITING_PARSE_PATTERN.exec(trimmed);
  if (editingMatch) {
    const [, left = '', letterRaw = '', middle = '', region = ''] = editingMatch;
    const letter = normalizeIranianLicensePlateLetter(letterRaw);

    return {
      left,
      letter: isIranianLicensePlateLetter(letter) ? letter : '',
      middle,
      region,
    };
  }

  const completeMatch = COMPLETE_PARSE_PATTERN.exec(trimmed);
  if (!completeMatch) {
    return null;
  }

  const [, leftRaw = '', letterRaw = '', middleRaw = '', regionRaw = ''] =
    completeMatch;
  const letter = normalizeIranianLicensePlateLetter(letterRaw);

  if (!isIranianLicensePlateLetter(letter)) {
    return null;
  }

  return {
    left: toLatinDigits(leftRaw),
    letter,
    middle: toLatinDigits(middleRaw),
    region: toLatinDigits(regionRaw),
  };
}

/** Normalize Latin/Arabic-Indic digits to Persian when the plate is complete. */
export function normalizeIranianLicensePlate(value: string): string {
  const parts = parseIranianLicensePlate(value);
  if (!parts) {
    return toPersianDigits(value.trim().replaceAll(/\s+/g, ''));
  }

  return stringifyIranianLicensePlate(parts);
}

export function isValidIranianLicensePlate(value: string): boolean {
  const normalized = normalizeIranianLicensePlate(value);
  return IRANIAN_LICENSE_PLATE_PATTERN.test(normalized);
}
