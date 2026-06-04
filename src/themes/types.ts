import { Page, Post, Title } from '@/src/types/blog'

export type ThemeId = 'anzifan' | 'touchgal' | 'gallery'

/**
 * 各主题首页组件共用 props。
 * posts 由 index 经 buildHomeFeedPosts 下发（默认全量；announcement、置顶优先排序），
 * 构建预渲染篇数见 STATIC_POST_PATHS_MAX（默认 80，与主题无关），
 * 且已按 Notion「pinned」置顶优先、再按日期降序（sortPostsByPinnedThenDate）。
 */
export type ThemeHomeProps = {
  posts: Post[]
  widgets: { [key: string]: unknown }
  siteTitle?: Title
  navPages?: Page[]
}
