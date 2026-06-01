import { Post } from '@/src/types/blog'

/** 按关键词过滤文章（标题、标签名，不区分大小写） */
export function filterGalleryPosts(posts: Post[], rawQuery: string): Post[] {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return posts

  return posts.filter((post) => {
    const title = (post.title || '').toLowerCase()
    if (title.includes(q)) return true
    return (post.tags || []).some((tag) =>
      (tag.name || '').toLowerCase().includes(q)
    )
  })
}

export function readSearchQuery(query: unknown): string {
  const raw = Array.isArray(query) ? query[0] : query
  return typeof raw === 'string' ? raw.trim() : ''
}
