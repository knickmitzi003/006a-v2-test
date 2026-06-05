/** Notion 自定义 Page：全站下载说明（slug=download） */
export const GALLERY_DOWNLOAD_INSTRUCTIONS_SLUG = 'download'

export function galleryPostDownloadHref(postSlug: string): string {
  const slug = postSlug?.trim()
  if (!slug) return '/'
  return `/post/${encodeURIComponent(slug)}/download`
}
