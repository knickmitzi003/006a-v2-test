import Link from 'next/link'
import { galleryPostDownloadHref } from '@/src/lib/gallery/galleryDownloadPaths'

type GalleryPostDownloadButtonProps = {
  postSlug: string
}

/** 文章内页右上角「下载」→ 专用下载页 */
export function GalleryPostDownloadButton({
  postSlug,
}: GalleryPostDownloadButtonProps) {
  return (
    <Link
      href={galleryPostDownloadHref(postSlug)}
      className="inline-block rounded-md bg-black px-6 py-2.5 text-[15px] font-bold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900"
    >
      下载
    </Link>
  )
}
