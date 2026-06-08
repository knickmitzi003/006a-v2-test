import { Post } from '@/src/types/blog'
import { loadSortedArchivePosts } from './buildArchiveFeed'

let navInflight: Promise<Post[]> | null = null

export function clearArchiveNavCache(): void {
  navInflight = null
}

/**
 * 轻量归档列表：供 prev/next 与 gallery 推荐。
 * 不在温 Serverless 实例上跨请求缓存，避免 ISR 再生仍读到旧列表。
 */
export async function getArchiveNavPosts(): Promise<Post[]> {
  if (process.env.DISABLE_ARCHIVE_NAV_CACHE === '1') {
    return loadSortedArchivePosts()
  }

  if (navInflight) {
    return navInflight
  }

  navInflight = loadSortedArchivePosts().finally(() => {
    navInflight = null
  })

  return navInflight
}
