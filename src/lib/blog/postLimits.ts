import CONFIG from '@/blog.config'
import { Post } from '@/src/types/blog'
import { ANNOUNCEMENT_SLUG, sortPostsByPinnedThenDate } from './pinnedPosts'

/**
 * 构建期文章数量上限（防 Vercel 部署超时）。全主题共用，与 Notion theme-config 无关。
 * - 首页：index → capHomePosts（anzifan / touchgal / gallery 等均消费 props.posts）
 * - 预渲染路径：post、tag、category、archive 的 getStaticPaths → capPostsForBuild
 * 超出路径走 fallback: 'blocking'。优先保留 announcement + 置顶，再按日期取满 N 篇。
 */
export const BLOG_HOME_POSTS_MAX =
  (CONFIG as { HOME_BUILD_POSTS_MAX?: number }).HOME_BUILD_POSTS_MAX ?? 80

/** 预渲染文章及相关列表页路径所依据的文章上限 */
export const BLOG_STATIC_POST_PATHS_MAX =
  (CONFIG as { STATIC_POST_PATHS_MAX?: number }).STATIC_POST_PATHS_MAX ?? 80

type PostCapFields = Pick<Post, 'slug' | 'pinned' | 'date'>

/** announcement 最先，其余置顶优先，再按发布日期降序 */
export function orderPostsForBuildCap<T extends PostCapFields>(posts: T[]): T[] {
  const announcement = posts.find((p) => p.slug === ANNOUNCEMENT_SLUG)
  const rest = posts.filter((p) => p.slug !== ANNOUNCEMENT_SLUG)
  const sortedRest = sortPostsByPinnedThenDate(rest)
  return announcement ? [announcement, ...sortedRest] : sortedRest
}

function sliceToMax<T>(posts: T[], max: number): T[] {
  if (posts.length <= max) return posts
  return posts.slice(0, max)
}

/** 首页下发文章列表（全主题共用） */
export function capHomePosts(posts: Post[]): Post[] {
  return sliceToMax(orderPostsForBuildCap(posts), BLOG_HOME_POSTS_MAX)
}

/** 构建 paths 时预渲染的文章集合（全主题共用） */
export function capPostsForBuild(posts: Post[]): Post[] {
  return sliceToMax(orderPostsForBuildCap(posts), BLOG_STATIC_POST_PATHS_MAX)
}
