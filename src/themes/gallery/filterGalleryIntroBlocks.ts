import { BlockDataType, BlockEnum, BlockType } from '@/src/types/blog'

/** 友链页正文中不展示的块（友链数据由 Friends 子库单独渲染） */
const SKIP_TYPES: BlockType[] = [
  BlockEnum.child_database,
  BlockEnum.child_page,
  BlockEnum.table_of_contents,
  BlockEnum.synced_block,
  BlockEnum.template,
  BlockEnum.link_to_page,
  BlockEnum.unsupported,
]

function blockHasVisibleContent(block: BlockDataType): boolean {
  if (SKIP_TYPES.includes(block.type)) return false

  if (block.type === BlockEnum.paragraph) {
    const rt =
      (block as { paragraph?: { rich_text?: { plain_text?: string }[] } })
        .paragraph?.rich_text ?? []
    return rt.some((t) => (t.plain_text || '').trim().length > 0)
  }

  if (block.type === BlockEnum.divider) return false

  return true
}

/** 过滤后若无内容则不再渲染空白正文框 */
export function filterGalleryIntroBlocks(
  blocks: BlockDataType[]
): BlockDataType[] {
  return blocks.filter(blockHasVisibleContent)
}
