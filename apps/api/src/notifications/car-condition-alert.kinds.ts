/** Keep aligned with car_condition_alerts_kind_check in the schema. */
export const CarConditionAlertKinds = {
  HIGH_RESISTANCE: 'high_resistance',
  LOW_FUEL: 'low_fuel',
} as const;

export type CarConditionAlertKind =
  (typeof CarConditionAlertKinds)[keyof typeof CarConditionAlertKinds];
