import { Post } from '@/src/types/blog'

type GalleryPostTitleDownloadMetaProps = {
  post: Post
  /** 与同行标题共用字号/字重类名 */
  titleClass: string
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

/** 标题旁下载元信息：文件数量 + 资源大小 */
export function GalleryPostTitleDownloadMeta({
  post,
  titleClass,
}: GalleryPostTitleDownloadMetaProps) {
  const { count, size } = splitCountAndSize(
    post.options?.downloadCount ?? '',
    post.options?.downloadSize ?? ''
  )
  if (!count && !size) return null

  const text = [count, size].filter(Boolean).join(' ')

  return (
    <span className={`shrink-0 whitespace-nowrap ${titleClass}`}>
      {text}
    </span>
  )
}
