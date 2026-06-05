import CONFIG from '@/blog.config'

/** Notion 自定义 Page：全站下载说明（与 DEFAULT_SPECIAL_PAGES.DOWNLOAD 一致） */
export const GALLERY_DOWNLOAD_INSTRUCTIONS_SLUG =
  CONFIG.DEFAULT_SPECIAL_PAGES.DOWNLOAD

export function galleryPostDownloadHref(postSlug: string): string {
  const slug = postSlug?.trim()
  if (!slug) return '/'
  return `/post/${encodeURIComponent(slug)}/download`
}
