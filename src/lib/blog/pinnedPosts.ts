import { Post } from '@/src/types/blog'

/** 站长通知（Post 类型，后台归入「自定义页面」） */
export const ANNOUNCEMENT_SLUG = 'announcement'

export function readPinnedFromNotionProperties(
  properties: Record<string, { type?: string; checkbox?: boolean }>
): boolean {
  const prop = properties.pinned ?? properties.Pinned
  if (!prop) return false
  if (prop.type === 'checkbox') return !!prop.checkbox
  return false
}

/** 置顶优先，同组内按发布日期降序（各主题首页/列表共用） */
export function sortPostsByPinnedThenDate<T extends Pick<Post, 'pinned' | 'date'>>(
  posts: T[]
): T[] {
  return [...posts].sort((a, b) => {
    const aPin = a.pinned ? 1 : 0
    const bPin = b.pinned ? 1 : 0
    if (aPin !== bPin) return bPin - aPin
    const aTime = new Date(a.date.created).getTime()
    const bTime = new Date(b.date.created).getTime()
    return bTime - aTime
  })
}

export function countPinnedPosts(posts: { pinned?: boolean }[]): number {
  return posts.filter((p) => p.pinned).length
}
