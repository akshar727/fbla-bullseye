/** Maps the internal DB value → human-readable display label */
export const CATEGORY_MAP: Record<string, string> = {
  electronics: "Electronics",
  clothing: "Clothing & Accessories",
  bags: "Bags & Containers",
  documents: "Documents & IDs",
  personal: "Personal Items & Miscellaneous",
};

/** Ordered list of internal category keys (matches CATEGORY_MAP) */
export const CATEGORY_KEYS = Object.keys(CATEGORY_MAP) as (keyof typeof CATEGORY_MAP)[];

/** Returns the display label for a stored category value, falling back to the raw value */
export function getCategoryLabel(value: string): string {
  return CATEGORY_MAP[value] ?? value;
}
