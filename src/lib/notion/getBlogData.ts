import { ApiScope } from '@/src/types/notion'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getAll } from './getDatabase'
import { readRichTextPlain } from './readProperty'

const THEME_CONFIG_SLUG = 'theme-config'

/** 单次构建/进程内复用，避免每个静态页重复请求 Notion */
let remoteThemeCached: string | null | undefined
let remoteThemeInflight: Promise<string | null> | null = null

function findThemeConfigPage(
  pages: PageObjectResponse[]
): PageObjectResponse | undefined {
  return pages.find(
    (page) => readRichTextPlain(page.properties['slug']) === THEME_CONFIG_SLUG
  )
}

async function fetchRemoteThemeFromNotion(): Promise<string | null> {
  const pages = await getPages()
  let themeConfigPage = findThemeConfigPage(pages)

  // 若 Page 列表未命中，再从全库 Page scope 查询结果中找一次（避免 type 过滤遗漏）
  if (!themeConfigPage) {
    const allPageScope = await getAll(ApiScope.Page)
    themeConfigPage = findThemeConfigPage(
      allPageScope.filter(
        (o): o is PageObjectResponse => o.object === 'page'
      ) as PageObjectResponse[]
    )
  }

  const excerpt = readRichTextPlain(themeConfigPage?.properties['excerpt'])
  return excerpt || null
}

/**
 * 读取 Notion 中 slug=theme-config 页面的 excerpt（v1 / v2 / gallery 等原始代号）。
 * 同一次 next build 内只请求 Notion 一次（Promise 去重）；失败时缓存 null，避免重试风暴。
 */
export const getRemoteTheme = async (): Promise<string | null> => {
  if (process.env.DISABLE_REMOTE_THEME_CACHE === '1') {
    try {
      return await fetchRemoteThemeFromNotion()
    } catch (e) {
      console.error('获取远程主题配置失败:', e)
      return null
    }
  }

  if (remoteThemeCached !== undefined) {
    return remoteThemeCached
  }

  if (!remoteThemeInflight) {
    remoteThemeInflight = fetchRemoteThemeFromNotion()
      .then((value) => {
        remoteThemeCached = value
        return value
      })
      .catch((e) => {
        console.error('获取远程主题配置失败:', e)
        remoteThemeCached = null
        return null
      })
      .finally(() => {
        remoteThemeInflight = null
      })
  }

  return remoteThemeInflight
}

/** 仅用于调试或测试；正常部署勿调用 */
export function clearRemoteThemeCache(): void {
  remoteThemeCached = undefined
  remoteThemeInflight = null
}

export const getPageBySlug = async (slug: string) => {
  const pages = await getPages()
  return (
    pages.find(
      (page) =>
        (page.properties['slug'] as any).rich_text[0]?.plain_text === slug
    ) ?? (null as unknown as PageObjectResponse)
  )
}

export const getPages = async () => {
  const objects = await getAll(ApiScope.Page)
  return objects.filter(
    (object) =>
      object.properties['type'].type === 'select' &&
      object.properties['type'].select?.name === 'Page'
  )
}

export const getPosts = async (
  scope: ApiScope.Home | ApiScope.Archive | ApiScope.Draft
) => {
  const objects = await getAll(scope)
  return objects.filter(
    (object) =>
      object.properties['type'].type === 'select' &&
      object.properties['type'].select?.name === 'Post'
  )
}

export const getPostsAndPieces = async (
  scope: ApiScope.Home | ApiScope.Archive | ApiScope.Draft
) => {
  const objects = await getAll(scope)
  return {
    posts: objects.filter(
      (object) =>
        object.properties['type'].type === 'select' &&
        object.properties['type'].select?.name === 'Post'
    ),
    pieces: objects.filter(
      (object) =>
        object.properties['type'].type === 'select' &&
        object.properties['type'].select?.name === 'Piece'
    ),
  }
}

export const getWidgets = async () => {
  const objects = await getAll(ApiScope.Home)
  return objects.filter(
    (object) =>
      object.properties['type'].type === 'select' &&
      object.properties['type'].select?.name === 'Widget'
  )
}