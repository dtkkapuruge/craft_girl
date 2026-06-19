export const PRODUCT_CATEGORIES = [
  { value: 'resin', label: 'Resin' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'chocolate-boxes', label: 'Chocolate Boxes' },
  { value: 'flower-preservation', label: 'Flower Preservation' },
  { value: 'handmade', label: 'Handmade Items' },
  { value: 'stationery', label: 'Stationery' },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];

export function getCategoryLabel(value: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/** Legacy slug mapping for existing category routes */
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'handmade-jewelry': 'jewellery',
  'resin-crafts': 'resin',
  stationery: 'stationery',
};

export function resolveCategorySlug(slug: string): string {
  return LEGACY_CATEGORY_MAP[slug] ?? slug;
}
