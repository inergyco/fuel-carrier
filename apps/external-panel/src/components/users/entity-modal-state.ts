export type EntityModalState<T> =
  | { mode: 'create' }
  | { mode: 'edit'; item: T }
  | null
