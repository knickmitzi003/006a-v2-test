import CONFIG from '@/blog.config'
import { Post } from '@/src/types/blog'
import { ANNOUNCEMENT_SLUG, sortPostsByPinnedThenDate } from './pinnedPosts'

/** 0 = 构建时不预渲染动态文章路径，首次访问 + 保存后按需 ISR（SaaS 省 CPU） */
export const BLOG_STATIC_POST_PATHS_MAX =
  (CONFIG as { STATIC_POST_PATHS_MAX?: number }).STATIC_POST_PATHS_MAX ?? 0

type PostOrderFields = Pick<Post, 'slug' | 'pinned' | 'date'>

/** announcement 最先，其余置顶优先，再按发布日期降序 */
export function orderPostsForFeed<T extends PostOrderFields>(posts: T[]): T[] {
  const announcement = posts.find((p) => p.slug === ANNOUNCEMENT_SLUG)
  const rest = posts.filter((p) => p.slug !== ANNOUNCEMENT_SLUG)
  const sortedRest = sortPostsByPinnedThenDate(rest)
  return announcement ? [announcement, ...sortedRest] : sortedRest
}

/** 首页 feed：全量文章 */
export function buildHomeFeedPosts(posts: Post[]): Post[] {
  return orderPostsForFeed(posts)
}

/**
 * getStaticPaths 预渲染集合。
 * STATIC_POST_PATHS_MAX=0 时返回空数组，依赖 fallback: blocking + 后台按需刷新。
 */
export function buildStaticPostPaths<T extends PostOrderFields>(posts: T[]): T[] {
  if (!BLOG_STATIC_POST_PATHS_MAX || BLOG_STATIC_POST_PATHS_MAX <= 0) {
    return []
  }
  return orderPostsForFeed(posts).slice(0, BLOG_STATIC_POST_PATHS_MAX)
}

/** 动态路由统一按需生成，避免构建期枚举全站路径 */
export const onDemandStaticPaths = {
  paths: [] as { params: Record<string, string> }[],
  fallback: 'blocking' as const,
}
