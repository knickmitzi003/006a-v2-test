import type { NextApiResponse } from 'next'
import CONFIG from '@/blog.config'
import { clearGalleryAdBannerCache } from '@/src/lib/gallery/loadGalleryAdBanner'
import { clearArchiveNavCache } from '@/src/lib/blog/archiveNavCache'
import { getAllCategories } from '@/src/lib/blog/format/category'
import { formatPages } from '@/src/lib/blog/format/page'
import { formatPosts, FORMAT_POST_LIST_OPTIONS } from '@/src/lib/blog/format/post'
import { getAllTags } from '@/src/lib/blog/format/tag'
import { clearCachedNavFooter } from '@/src/lib/notion/getCachedMem'
import {
  clearRemoteThemeCache,
  getPages,
  getPosts,
  getPostsAndPieces,
  setRevalidateFreshTheme,
} from '@/src/lib/notion/getBlogData'
import { ApiScope } from '@/src/types/notion'

const { CATEGORY, TAG, ARCHIVE } = CONFIG.DEFAULT_SPECIAL_PAGES
const DEDICATED_PAGE_ROUTES = new Set(
  Object.values(CONFIG.DEFAULT_SPECIAL_PAGES)
)

/** slug → 独立路由（与 pages/*.tsx 对应，勿重复生成 [page] 路径） */
const DEDICATED_SLUG_TO_PATH: Record<string, string> = {
  [CONFIG.DEFAULT_SPECIAL_PAGES.ABOUT]: '/about',
  [CONFIG.DEFAULT_SPECIAL_PAGES.FREINDS]: '/friends',
  [CONFIG.DEFAULT_SPECIAL_PAGES.DOWNLOAD]: '/download',
  [CONFIG.DEFAULT_SPECIAL_PAGES.ARCHIVE]: `/${ARCHIVE}`,
  [CONFIG.DEFAULT_SPECIAL_PAGES.CATEGORY]: `/${CATEGORY}`,
  [CONFIG.DEFAULT_SPECIAL_PAGES.TAG]: `/${TAG}`,
}

export type RevalidateResult = {
  path: string
  ok: boolean
  error?: string
}

/** 清空构建期进程内缓存，确保 ISR 再生时拉取最新 Notion 数据 */
export function clearContentBuildCaches(): void {
  clearCachedNavFooter()
  clearRemoteThemeCache()
  clearGalleryAdBannerCache()
  clearArchiveNavCache()
}

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function resolvePublicPagePath(slug: string): string {
  return DEDICATED_SLUG_TO_PATH[slug] ?? `/${slug}`
}

/** 后台保存时按 slug/type 选择刷新 scope */
export const SPECIAL_PAGE_SLUGS = new Set([
  'announcement',
  'about',
  'download',
  'theme-config',
])

export function resolveSaveRevalidateScope(
  type: string,
  slug: string
): 'post' | 'page' | 'widget' | 'gallery-ad' {
  if (type === 'Widget') {
    return slug === 'gallery-ad' ? 'gallery-ad' : 'widget'
  }
  if (type === 'Page' || SPECIAL_PAGE_SLUGS.has(slug)) {
    return 'page'
  }
  return 'post'
}

/** Gallery 广告：壳层 + 首页归档最新一批文章页（其余随 ISR / 访问更新） */
export async function collectGalleryAdRevalidatePaths(): Promise<string[]> {
  const paths = new Set<string>(collectShellRevalidatePaths())
  const { posts, pieces } = await getPostsAndPieces(ApiScope.Archive)
  const formatted = await formatPosts([...posts, ...pieces], FORMAT_POST_LIST_OPTIONS)
  const sorted = formatted.sort(
    (a, b) =>
      Number(new Date(b.date.created)) - Number(new Date(a.date.created))
  )
  const recent = sorted.slice(0, CONFIG.ARCHIVE_PER_COUNT)
  for (const post of recent) {
    paths.add(`/post/${post.slug}`)
    paths.add(`/post/${post.slug}/download`)
  }
  return Array.from(paths)
}

/** 删除文章后刷新（与保存类似，含旧 slug 路径） */
export async function collectDeleteRevalidatePaths(
  slug: string,
  options?: {
    categoryId?: string | null
    tagIds?: string[]
  }
): Promise<string[]> {
  return collectPostRevalidatePaths(slug, options)
}

/** 壳层列表页：不含单篇文章路径（SaaS 默认刷新范围） */
export function collectShellRevalidatePaths(): string[] {
  return [
    '/',
    '/about',
    '/friends',
    '/download',
    `/${ARCHIVE}`,
    `/${CATEGORY}`,
    `/${TAG}`,
  ]
}

/** 计算文章在归档分页中的路径（仅刷新相关页，不扫全部分页） */
async function collectArchivePathsForSlugs(
  slugs: string[]
): Promise<string[]> {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)))
  if (uniqueSlugs.length === 0) {
    return [`/${ARCHIVE}`]
  }

  const { posts, pieces } = await getPostsAndPieces(ApiScope.Archive)
  const formatted = await formatPosts([...posts, ...pieces], FORMAT_POST_LIST_OPTIONS)
  const sorted = [...formatted].sort(
    (a, b) =>
      Number(new Date(b.date.created)) - Number(new Date(a.date.created))
  )

  const paths = new Set<string>([`/${ARCHIVE}`])
  const perCount = CONFIG.ARCHIVE_PER_COUNT

  for (const slug of uniqueSlugs) {
    const index = sorted.findIndex((p) => p.slug === slug)
    if (index < 0) continue
    const page = Math.floor(index / perCount) + 1
    if (page > 1) {
      paths.add(`/${ARCHIVE}/${page}`)
    }
  }

  return Array.from(paths)
}

/** 收集全站路径（仅显式「完整重建」时使用，勿作为保存默认） */
export async function collectAllRevalidatePaths(): Promise<string[]> {
  const paths = new Set<string>(collectShellRevalidatePaths())

  const [{ posts, pieces }, pagesRaw] = await Promise.all([
    getPostsAndPieces(ApiScope.Archive),
    getPages(),
  ])

  const formattedPosts = await formatPosts(posts, FORMAT_POST_LIST_OPTIONS)
  const formattedPieces = await formatPosts(pieces, FORMAT_POST_LIST_OPTIONS)
  const formattedPages = formatPages(pagesRaw)

  for (const post of [...formattedPosts, ...formattedPieces]) {
    paths.add(`/post/${post.slug}`)
    paths.add(`/post/${post.slug}/download`)
  }

  for (const category of getAllCategories([...formattedPosts, ...formattedPieces])) {
    paths.add(`/category/${category.id}`)
  }

  for (const tag of getAllTags([...formattedPosts, ...formattedPieces])) {
    paths.add(`/tag/${tag.id}`)
  }

  const archiveCount = formattedPosts.length + formattedPieces.length
  const archivePageCount = Math.max(
    1,
    Math.ceil(archiveCount / CONFIG.ARCHIVE_PER_COUNT)
  )
  for (let page = 2; page <= archivePageCount; page += 1) {
    paths.add(`/archive/${page}`)
  }

  for (const page of formattedPages) {
    if (page.status !== 'Published') continue
    if (DEDICATED_PAGE_ROUTES.has(page.slug)) continue
    paths.add(`/${page.slug}`)
  }

  const draftPosts = await getPosts(ApiScope.Draft)
  const formattedDrafts = await formatPosts(draftPosts, FORMAT_POST_LIST_OPTIONS)
  for (const post of formattedDrafts) {
    paths.add(`/draft/${post.slug}`)
  }

  return Array.from(paths)
}

/** 单篇文章保存：只刷新首页、列表壳层、相关分类/标签、本文与所在归档页 */
export async function collectPostRevalidatePaths(
  slug: string,
  options?: {
    categoryId?: string | null
    tagIds?: string[]
    previousSlug?: string | null
  }
): Promise<string[]> {
  const paths = new Set<string>([
    '/',
    `/${ARCHIVE}`,
    `/${CATEGORY}`,
    `/${TAG}`,
    `/post/${slug}`,
    `/post/${slug}/download`,
  ])

  if (options?.previousSlug && options.previousSlug !== slug) {
    paths.add(`/post/${options.previousSlug}`)
    paths.add(`/post/${options.previousSlug}/download`)
  }

  if (options?.categoryId) {
    paths.add(`/category/${options.categoryId}`)
  }

  for (const tagId of options?.tagIds ?? []) {
    if (tagId) paths.add(`/tag/${tagId}`)
  }

  const archiveSlugs = [slug]
  if (options?.previousSlug && options.previousSlug !== slug) {
    archiveSlugs.push(options.previousSlug)
  }
  for (const archivePath of await collectArchivePathsForSlugs(archiveSlugs)) {
    paths.add(archivePath)
  }

  return Array.from(paths)
}

/** Notion Page 类型保存：刷新壳层 + 该页面路由 */
export function collectPageRevalidatePaths(
  slug: string,
  options?: { previousSlug?: string | null }
): string[] {
  const paths = new Set<string>(collectShellRevalidatePaths())
  paths.add(resolvePublicPagePath(slug))
  if (options?.previousSlug && options.previousSlug !== slug) {
    paths.add(resolvePublicPagePath(options.previousSlug))
  }
  return Array.from(paths)
}

export async function revalidateMany(
  res: NextApiResponse,
  paths: string[],
  options?: { freshTheme?: boolean; clearCaches?: boolean }
): Promise<RevalidateResult[]> {
  const unique = Array.from(new Set(paths.map(normalizePath)))
  const results: RevalidateResult[] = []
  const freshTheme = options?.freshTheme ?? false
  const clearCaches = options?.clearCaches ?? false

  if (clearCaches || freshTheme) {
    clearContentBuildCaches()
  }
  if (freshTheme) {
    setRevalidateFreshTheme(true)
  }

  try {
    for (const path of unique) {
      try {
        await res.revalidate(path)
        results.push({ path, ok: true })
      } catch (error) {
        results.push({
          path,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  } finally {
    if (freshTheme) {
      setRevalidateFreshTheme(false)
    }
  }

  return results
}
