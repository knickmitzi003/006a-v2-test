import Link from 'next/link'
import { GalleryRecommendPost } from '@/src/lib/gallery/galleryRecommendations'

function formatPostDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

type GalleryPopularSidebarProps = {
  posts: GalleryRecommendPost[]
  className?: string
}

/** Gallery Epic 风格：内页右侧「热门推荐」竖向列表 */
export function GalleryPopularSidebar({
  posts,
  className = '',
}: GalleryPopularSidebarProps) {
  if (!posts.length) return null

  return (
    <aside className={`w-[220px] shrink-0 ${className}`.trim()}>
      <h2 className="mb-4 font-gallery text-[13px] font-normal text-neutral-400">
        热门推荐
      </h2>
      <ul className="flex flex-col gap-4">
        {posts.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/post/${item.slug}`}
              className="group flex gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="h-[54px] w-[42px] shrink-0 overflow-hidden rounded-sm bg-neutral-100">
                {item.coverSrc ? (
                  <img
                    src={item.coverSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-300">
                    P
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="line-clamp-2 font-gallery text-[12px] font-normal leading-snug text-neutral-800 transition-colors group-hover:text-neutral-500">
                  {item.title}
                </p>
                {item.date ? (
                  <p className="mt-1 font-gallery text-[11px] text-neutral-400">
                    {formatPostDate(item.date)}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
