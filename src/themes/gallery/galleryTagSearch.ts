import { Tag } from '@/src/types/blog'

export function filterGalleryTags(tags: Tag[], rawQuery: string): Tag[] {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return tags
  return tags.filter((t) => (t.name || '').toLowerCase().includes(q))
}
