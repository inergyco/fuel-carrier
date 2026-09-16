/** Escape `\`, `%`, and `_` so user input is matched literally in ILIKE patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Build a case-insensitive contains pattern (`%value%`) from raw search text. */
export function toIlikeContainsPattern(searchText: string): string {
  return `%${escapeIlikePattern(searchText)}%`;
}
