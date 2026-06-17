import { Client, isFullPage } from '@notionhq/client'
import CONFIG from '@/blog.config'
import { syncGalleryImages } from '@/src/lib/gallery/galleryDb'
import {
  findNotionPropertyKey,
  normalizeMediaUrl,
  DOWNLOAD_COUNT_PROPERTY_NAMES,
  DOWNLOAD_SIZE_PROPERTY_NAMES,
} from '@/src/lib/notion/readProperty'
import { slugEqualsFilter } from '@/src/lib/notion/filter'
import { queryDatabasePages } from '@/src/lib/notion/getDatabase'
import type { CrawlerQueueRow } from '@/src/lib/ingest/crawlerQueueDb'

const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isTransient = (e: unknown) => {
  const msg = String((e as Error)?.message || '')
  const code = String((e as { code?: string })?.code || '')
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|socket hang up|network|fetch failed|aborted/i.test(
    msg
  ) ||
    /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ECONNREFUSED|ENOTFOUND/i.test(code) ||
    (e as { status?: number })?.status === 429 ||
    (e as { status?: number })?.status === 502 ||
    (e as { status?: number })?.status === 503 ||
    (e as { status?: number })?.status === 504
}

async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (!isTransient(e) || i === retries - 1) throw e
      await sleep(500 * Math.pow(2, i))
    }
  }
  throw lastErr
}

function databaseId(): string {
  return process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID || CONFIG.NOTION_PAGE_ID
}

function buildRichTextProperty(
  value: string,
  targetProp: { type?: string } | undefined
) {
  const text = typeof value === 'string' ? value.trim() : ''
  const propType = targetProp?.type || 'rich_text'
  if (propType === 'rich_text') {
    return { rich_text: text ? [{ text: { content: text } }] : [] }
  }
  return { rich_text: text ? [{ text: { content: text } }] : [] }
}

function buildDownloadProperty(
  value: string,
  targetProp: { type?: string } | undefined
) {
  const text = typeof value === 'string' ? value : ''
  const propType = targetProp?.type || 'rich_text'
  if (propType === 'rich_text') {
    return { rich_text: text ? [{ text: { content: text } }] : [] }
  }
  if (propType === 'url') {
    return text.startsWith('http') ? { url: text } : { url: null }
  }
  return { rich_text: text ? [{ text: { content: text } }] : [] }
}

function contentToNotionChildren(content: string): Array<Record<string, unknown>> {
  const text = (content || '').trim()
  if (!text) return []
  const lines = text.split(/\r?\n/)
  const blocks: Array<Record<string, unknown>> = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ text: { content: trimmed } }],
      },
    })
  }
  return blocks
}

type NotionPropsSchema = Record<string, { type?: string }>

async function loadTargetProps(pageId?: string | null): Promise<NotionPropsSchema> {
  if (pageId) {
    const page = await withRetry(() => notion.pages.retrieve({ page_id: pageId }))
    if (!isFullPage(page)) {
      throw new Error('Notion 页面数据不完整')
    }
    return page.properties as NotionPropsSchema
  }
  const db = await withRetry(() =>
    notion.databases.retrieve({ database_id: databaseId() })
  )
  return db.properties as NotionPropsSchema
}

function buildNotionProperties(
  row: CrawlerQueueRow,
  coverUrl: string,
  targetProps: NotionPropsSchema
): Record<string, unknown> {
  const status =
    process.env.CRAWLER_INGEST_DEFAULT_STATUS?.trim() || 'Published'
  const date = new Date().toISOString().split('T')[0]

  const titleKey = targetProps.title ? 'title' : targetProps.Page ? 'Page' : 'title'
  const props: Record<string, unknown> = {}

  props[titleKey] = {
    title: [{ text: { content: row.title.trim() || '无标题' } }],
  }
  props.slug = { rich_text: [{ text: { content: row.slug.trim() } }] }
  props.excerpt = {
    rich_text: [{ text: { content: (row.excerpt || '').trim() } }],
  }

  if (row.category?.trim()) {
    props.category = { select: { name: row.category.trim() } }
  } else {
    props.category = { select: null }
  }

  const tagNames = (row.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  props.tags = {
    multi_select: tagNames.map((name) => ({ name })),
  }

  const statusType = targetProps.status?.type || 'select'
  if (statusType === 'status') {
    props.status = { status: { name: status } }
  } else {
    props.status = { select: { name: status } }
  }

  props.type = { select: { name: 'Post' } }
  props.date = { date: { start: date } }

  const normalizedCover = normalizeMediaUrl(coverUrl)
  props.cover = normalizedCover
    ? { url: normalizedCover }
    : { url: null }

  props.download = buildDownloadProperty(row.download || '', targetProps.download)

  const sizeKey = findNotionPropertyKey(
    targetProps as never,
    DOWNLOAD_SIZE_PROPERTY_NAMES
  )
  if (sizeKey) {
    props[sizeKey] = buildRichTextProperty(
      row.download_size || '',
      targetProps[sizeKey]
    )
  }

  const countKey = findNotionPropertyKey(
    targetProps as never,
    DOWNLOAD_COUNT_PROPERTY_NAMES
  )
  if (countKey) {
    props[countKey] = buildRichTextProperty(
      row.download_count || '',
      targetProps[countKey]
    )
  }

  return props
}

async function replacePageBody(pageId: string, content: string) {
  const children = await withRetry(() =>
    notion.blocks.children.list({ block_id: pageId })
  )
  if (children.results.length > 0) {
    for (const blk of children.results) {
      await withRetry(() => notion.blocks.delete({ block_id: blk.id }))
    }
  }

  const newBlocks = contentToNotionChildren(content)
  if (newBlocks.length === 0) return

  for (let i = 0; i < newBlocks.length; i += 100) {
    await withRetry(() =>
      notion.blocks.children.append({
        block_id: pageId,
        children: newBlocks.slice(i, i + 100) as never,
      })
    )
    if (i + 100 < newBlocks.length) await sleep(100)
  }
}

async function findNotionPageIdBySlug(slug: string): Promise<string | null> {
  const trimmed = slug.trim()
  if (!trimmed) return null
  const results = await queryDatabasePages(slugEqualsFilter(trimmed), {
    pageSize: 1,
  })
  const page = results[0]
  return page?.id ?? null
}

export type ProcessCrawlerRowResult = {
  notionPageId: string
  slug: string
  imageCount: number
  action: 'created' | 'updated'
}

/**
 * 将队列行写入 Notion（Post）并同步 Gallery 图库。
 * 封面 = image_urls[0]；正文优先 content，否则 excerpt。
 */
export async function processCrawlerGalleryRow(
  row: CrawlerQueueRow
): Promise<ProcessCrawlerRowResult> {
  const slug = row.slug.trim()
  if (!slug) throw new Error('slug 不能为空')

  const imageUrls = row.image_urls.filter((u) => u.startsWith('http'))
  if (imageUrls.length === 0) {
    throw new Error('image_urls 至少需一张兰空图链')
  }

  const coverUrl = imageUrls[0]
  const bodyContent = (row.content || '').trim() || (row.excerpt || '').trim()

  let pageId = row.notion_page_id?.trim() || null
  let action: 'created' | 'updated' = 'updated'

  if (!pageId) {
    pageId = await findNotionPageIdBySlug(slug)
  }

  if (pageId) {
    const targetProps = await loadTargetProps(pageId)
    const props = buildNotionProperties(row, coverUrl, targetProps)
    await withRetry(() =>
      notion.pages.update({
        page_id: pageId!,
        properties: props as never,
      })
    )
    await replacePageBody(pageId!, bodyContent)
  } else {
    const targetProps = await loadTargetProps(null)
    const props = buildNotionProperties(row, coverUrl, targetProps)
    const children = contentToNotionChildren(bodyContent)
    const page = await withRetry(() =>
      notion.pages.create({
        parent: { database_id: databaseId() },
        properties: props as never,
        children: children.slice(0, 100) as never,
      })
    )
    pageId = page.id
    action = 'created'
  }

  const galleryResult = await syncGalleryImages({
    postSlug: slug,
    postNotionId: pageId,
    title: row.title,
    images: imageUrls.map((url) => ({ url, thumb_url: url })),
  })

  return {
    notionPageId: pageId!,
    slug,
    imageCount: galleryResult.imageCount,
    action,
  }
}
