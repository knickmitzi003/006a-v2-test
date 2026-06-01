import { ApiScope } from '@/src/types/notion'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getAll } from './getDatabase'
import { readRichTextPlain } from './readProperty'

const THEME_CONFIG_SLUG = 'theme-config'

function findThemeConfigPage(
  pages: PageObjectResponse[]
): PageObjectResponse | undefined {
  return pages.find(
    (page) => readRichTextPlain(page.properties['slug']) === THEME_CONFIG_SLUG
  )
}

/**
 * 读取 Notion 中 slug=theme-config 页面的 excerpt（v1 / v2 / gallery 等原始代号）
 */
export const getRemoteTheme = async (): Promise<string | null> => {
  try {
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

    return readRichTextPlain(themeConfigPage?.properties['excerpt'])
  } catch (e) {
    console.error('获取远程主题配置失败:', e)
    return null
  }
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