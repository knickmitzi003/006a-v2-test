import { BlockEnum } from '@/src/types/blog'
import { BlockResponse } from '@/src/types/notion'

/**
 * Gallery 内页正文：
 * - 有 Supabase 图库：大图走图库网格，正文跳过 image 块（封面仅用于列表卡片）
 * - 无图库：保留 Notion 正文 image 块，支持纯图文文章
 */
export function filterGalleryBodyBlocks(
  blocks: BlockResponse[],
  hasGallery: boolean
): BlockResponse[] {
  if (!hasGallery) return blocks
  return blocks.filter((block) => block.type !== BlockEnum.image)
}

export function hasGalleryBodyContent(
  blocks: BlockResponse[],
  hasGallery: boolean
): boolean {
  return filterGalleryBodyBlocks(blocks, hasGallery).length > 0
}

/** @deprecated 使用 hasGalleryBodyContent */
export function hasGalleryTextBody(
  blocks: BlockResponse[],
  hasGallery = true
): boolean {
  return hasGalleryBodyContent(blocks, hasGallery)
}
