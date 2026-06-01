import { Category } from '@/src/types/blog'

export function filterGalleryCategories(
  categories: Category[],
  rawQuery: string
): Category[] {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return categories
  return categories.filter((c) => (c.name || '').toLowerCase().includes(q))
}
