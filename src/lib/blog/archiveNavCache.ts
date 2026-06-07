import { Post } from '@/src/types/blog'
import { isRevalidateFreshTheme } from '@/src/lib/notion/getBlogData'
import { loadSortedArchivePosts } from './buildArchiveFeed'

let cachedNavPosts: Post[] | undefined
let navInflight: Promise<Post[]> | null = null

export function clearArchiveNavCache(): void {
  cachedNavPosts = undefined
  navInflight = null
}

/** 轻量归档列表：供 prev/next 与 gallery 推荐；同进程内去重，ISR 刷新时清缓存 */
export async function getArchiveNavPosts(): Promise<Post[]> {
  if (
    isRevalidateFreshTheme() ||
    process.env.DISABLE_ARCHIVE_NAV_CACHE === '1'
  ) {
    return loadSortedArchivePosts()
  }

  if (cachedNavPosts) {
    return cachedNavPosts
  }

  if (!navInflight) {
    navInflight = loadSortedArchivePosts()
      .then((posts) => {
        cachedNavPosts = posts
        return posts
      })
      .finally(() => {
        navInflight = null
      })
  }

  return navInflight
}
