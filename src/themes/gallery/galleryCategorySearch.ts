import { Category } from '@/src/types/blog'

/** 分类列表页不展示的分类（如站长通知） */
const GALLERY_HIDDEN_CATEGORY_NAMES = new Set(['站长通知'])

export function excludeGalleryHiddenCategories(
  categories: Category[]
): Category[] {
  return categories.filter(
    (c) => !GALLERY_HIDDEN_CATEGORY_NAMES.has((c.name || '').trim())
  )
}

export function filterGalleryCategories(
  categories: Category[],
  rawQuery: string
): Category[] {
  const visible = excludeGalleryHiddenCategories(categories)
  const q = rawQuery.trim().toLowerCase()
  if (!q) return visible
  return visible.filter((c) => (c.name || '').toLowerCase().includes(q))
}
