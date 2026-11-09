import type { TranslationFunctions } from '@fuel-carrier/i18n'

/**
 * Stored vehicle alerts are English sentences from the API.
 * Keep these patterns aligned with the alert builders and `browser-push-sw.js`.
 */
const LOW_FUEL_TITLE = 'Low fuel'
const HIGH_RESISTANCE_TITLE = 'High tank resistance'
const STALE_TELEMETRY_TITLE = 'Stale telemetry'

const LOW_FUEL_BODY =
  /^Remaining fuel is (\d+(?:\.\d+)?)% \((\d+(?:\.\d+)?) L\), below (\d+(?:\.\d+)?)%\.$/

const RESISTANCE_LINE =
  /^(Tank to ground|Tank to nozzle|Ground to vehicle) is (\d+(?:\.\d+)?) Ω, above the (\d+(?:\.\d+)?) Ω limit\.$/

const OPEN_RESISTANCE_LINE =
  /^(Tank to ground|Tank to nozzle|Ground to vehicle): Open line\.$/

const STALE_TELEMETRY_BODY =
  /^The device sample is about (\d+) minutes old \(limit (\d+) minutes\)\.$/

const PROBE_LABELS = [
  'Tank to ground',
  'Tank to nozzle',
  'Ground to vehicle',
] as const

type ProbeLabel = (typeof PROBE_LABELS)[number]

type ParsedResistanceProbe =
  | {
      kind: 'high'
      probe: ProbeLabel
      ohms: number
      limitOhms: number
    }
  | {
      kind: 'open_line'
      probe: ProbeLabel
    }

type ParsedCarAlert =
  | {
      kind: 'low_fuel'
      percent: number
      liters: number
      thresholdPercent: number
    }
  | {
      kind: 'high_resistance'
      probes: ParsedResistanceProbe[]
    }
  | {
      kind: 'stale_telemetry'
      ageMinutes: number
      limitMinutes: number
    }

export type LocalizedNotificationCopy = {
  title: string
  body: string
}

export function localizeCarAlertMessage(input: {
  title: string
  body: string
  locale: string
  LL: TranslationFunctions
}): LocalizedNotificationCopy {
  const parsed = parseCarAlertMessage(input.title, input.body)
  if (!parsed) {
    return { title: input.title, body: input.body }
  }

  return formatCarAlertMessage({
    parsed,
    locale: input.locale,
    LL: input.LL,
  })
}

function parseCarAlertMessage(
  title: string,
  body: string,
): ParsedCarAlert | null {
  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()

  if (trimmedTitle === LOW_FUEL_TITLE) {
    const match = LOW_FUEL_BODY.exec(trimmedBody)
    if (!match) {
      return null
    }

    return {
      kind: 'low_fuel',
      percent: Number(match[1]),
      liters: Number(match[2]),
      thresholdPercent: Number(match[3]),
    }
  }

  if (trimmedTitle === HIGH_RESISTANCE_TITLE) {
    const lines = trimmedBody.split('\n')
    const probes: ParsedResistanceProbe[] = []

    for (const line of lines) {
      const probe = parseResistanceProbeLine(line)
      if (!probe) {
        return null
      }

      probes.push(probe)
    }

    if (probes.length === 0) {
      return null
    }

    return { kind: 'high_resistance', probes }
  }

  if (trimmedTitle === STALE_TELEMETRY_TITLE) {
    const match = STALE_TELEMETRY_BODY.exec(trimmedBody)
    if (!match) {
      return null
    }

    return {
      kind: 'stale_telemetry',
      ageMinutes: Number(match[1]),
      limitMinutes: Number(match[2]),
    }
  }

  return null
}

function formatCarAlertMessage(input: {
  parsed: ParsedCarAlert
  locale: string
  LL: TranslationFunctions
}): LocalizedNotificationCopy {
  const { parsed, locale, LL } = input
  const copy = LL.common.carAlerts

  if (parsed.kind === 'low_fuel') {
    return {
      title: copy.lowFuelTitle(),
      body: copy.lowFuelBody({
        percent: formatPercent(parsed.percent, locale),
        volume: formatVolume(parsed.liters, locale, LL),
        threshold: formatPercent(parsed.thresholdPercent, locale),
      }),
    }
  }

  if (parsed.kind === 'high_resistance') {
    const lines = parsed.probes.map((probe) =>
      formatHighResistanceLine({ probe, locale, LL }),
    )

    return {
      title: copy.highResistanceTitle(),
      body: lines.join('\n'),
    }
  }

  return {
    title: copy.staleTelemetryTitle(),
    body: copy.staleTelemetryBody({
      age: formatAmount(parsed.ageMinutes, locale),
      limit: formatAmount(parsed.limitMinutes, locale),
    }),
  }
}

function parseResistanceProbeLine(line: string): ParsedResistanceProbe | null {
  const openLine = OPEN_RESISTANCE_LINE.exec(line)
  if (openLine?.[1] && isProbeLabel(openLine[1])) {
    return { kind: 'open_line', probe: openLine[1] }
  }

  const match = RESISTANCE_LINE.exec(line)
  if (!match?.[1] || !isProbeLabel(match[1])) {
    return null
  }

  return {
    kind: 'high',
    probe: match[1],
    ohms: Number(match[2]),
    limitOhms: Number(match[3]),
  }
}

function formatHighResistanceLine(input: {
  probe: ParsedResistanceProbe
  locale: string
  LL: TranslationFunctions
}): string {
  const copy = input.LL.common.carAlerts
  const probe = probeLabel(input.probe.probe, input.LL)

  if (input.probe.kind === 'open_line') {
    return copy.highResistanceOpenLine({ probe })
  }

  return copy.highResistanceLine({
    probe,
    ohms: formatOhms(input.probe.ohms, input.locale, input.LL),
    limit: formatOhms(input.probe.limitOhms, input.locale, input.LL),
  })
}

function probeLabel(probe: ProbeLabel, LL: TranslationFunctions): string {
  switch (probe) {
    case 'Tank to ground':
      return LL.common.carTelemetry.resistanceTankToGround()
    case 'Tank to nozzle':
      return LL.common.carTelemetry.resistanceTankToNozzle()
    case 'Ground to vehicle':
      return LL.common.carTelemetry.resistanceGroundToVehicle()
  }
}

const isProbeLabel = (value: string): value is ProbeLabel =>
  PROBE_LABELS.some((probe) => probe === value)

const formatAmount = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)

const formatPercent = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100)

const formatVolume = (
  liters: number,
  locale: string,
  LL: TranslationFunctions,
) => `${formatAmount(liters, locale)} ${LL.common.carTelemetry.volumeUnit()}`

const formatOhms = (
  ohms: number,
  locale: string,
  LL: TranslationFunctions,
) => `${formatAmount(ohms, locale)} ${LL.common.carTelemetry.resistanceUnit()}`
