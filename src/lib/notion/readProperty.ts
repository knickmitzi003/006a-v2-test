import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

/** 读取 Notion rich_text 属性全文（支持多段 rich_text） */
export function readRichTextPlain(
  prop: PageObjectResponse['properties'][string] | undefined
): string | null {
  if (!prop || prop.type !== 'rich_text') return null
  const text = prop.rich_text.map((t) => t.plain_text).join('').trim()
  return text || null
}
