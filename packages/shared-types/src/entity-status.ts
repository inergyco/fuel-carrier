export const EntityStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type EntityStatus =
  (typeof EntityStatuses)[keyof typeof EntityStatuses];
