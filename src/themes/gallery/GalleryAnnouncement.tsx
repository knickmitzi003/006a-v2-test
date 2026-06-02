import Link from 'next/link'
import { galleryAnnouncementBarClass } from './galleryFonts'

type AnnouncementPost = {
  title?: string
  slug?: string
}

export const GalleryAnnouncement = ({
  announcement,
}: {
  announcement?: AnnouncementPost | null
}) => {
  const title = announcement?.title?.trim()
  if (!title) return null

  const slug = announcement?.slug || 'announcement'
  const href = `/post/${slug}`

  return (
    <div className="px-6 pb-3 pt-3">
      <Link
        href={href}
        className={`group flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 py-2.5 transition-colors hover:border-neutral-300 ${galleryAnnouncementBarClass}`}
      >
        <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center text-neutral-900">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m3 11 18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate group-hover:underline decoration-neutral-400 underline-offset-2">
          {title}
        </span>
      </Link>
    </div>
  )
}
