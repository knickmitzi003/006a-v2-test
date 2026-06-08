import CONFIG from '@/blog.config'
import { Post } from '@/src/types/blog'

export function isDefaultPostCover(src: string | null | undefined): boolean {
  const s = (src || '').trim()
  return !!s && s === CONFIG.DEFAULT_POST_COVER
}

/** Gallery 推荐缩略图：不使用站点默认占位封面 */
export function resolvePostCoverSrc(post: Post): string {
  const src = post.cover?.light?.src?.trim() || ''
  if (!src || isDefaultPostCover(src)) return ''
  return src
}

export function pickGalleryRecommendCover(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    const src = (candidate || '').trim()
    if (src && !isDefaultPostCover(src)) return src
  }
  return ''
}
