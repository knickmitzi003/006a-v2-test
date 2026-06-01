import Link from 'next/link'

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
    <div className="px-6 pb-4 pt-4">
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-[14px] transition-colors hover:border-neutral-300"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-900">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m3 11 18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-neutral-900 group-hover:underline">
          {title}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </div>
  )
}
