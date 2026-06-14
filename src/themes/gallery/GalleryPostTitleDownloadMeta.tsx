import { Post } from '@/src/types/blog'

type GalleryPostTitleLineProps = {
  post: Post
  /** 与标题行共用字号/字重类名 */
  titleClass: string
  className?: string
}

const SIZE_IN_TEXT_RE = /\d+(?:\.\d+)?\s*(?:MB|GB|GiB|KB|TB)\b/i

function splitCountAndSize(rawCount: string, rawSize: string) {
  const size = rawSize.trim()
  let count = rawCount.trim()
  if (size) return { count, size }
  const match = count.match(SIZE_IN_TEXT_RE)
  if (!match) return { count, size: '' }
  return {
    count: count
      .replace(match[0], '')
      .replace(/[-–—\s]+$/g, '')
      .trim(),
    size: match[0].trim(),
  }
}

/** 文章内页 / 下载页标题行：分类名 + 标题 + 下载信息（数量与大小） */
export function GalleryPostTitleLine({
  post,
  titleClass,
  className = '',
}: GalleryPostTitleLineProps) {
  const categoryName = post.category?.name?.trim() ?? ''
  const { count, size } = splitCountAndSize(
    post.options?.downloadCount ?? '',
    post.options?.downloadSize ?? ''
  )
  const downloadText = [count, size].filter(Boolean).join(' ')

  return (
    <h1 className={`min-w-0 ${titleClass} ${className}`.trim()}>
      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {categoryName ? <span>{categoryName}</span> : null}
        <span>{post.title}</span>
        {downloadText ? <span>{downloadText}</span> : null}
      </span>
    </h1>
  )
}
