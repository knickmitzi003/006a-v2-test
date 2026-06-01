type GalleryPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = number | 'ellipsis'

/** Gallery Epic：靠前显示连续页码，中间省略，末尾显示总页 */
function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ]
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  )
}

export function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  if (totalPages <= 1) return null

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages
  const items = buildPageItems(currentPage, totalPages)

  const arrowClass =
    'flex h-8 w-8 items-center justify-center text-neutral-900 transition-colors duration-200 hover:text-neutral-500 disabled:pointer-events-none disabled:text-neutral-300'

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-3 pb-6 sm:gap-4"
      aria-label="文章分页"
    >
      <button
        type="button"
        className={arrowClass}
        disabled={!canPrev}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="上一页"
      >
        <Chevron direction="left" />
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        {items.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="min-w-[1.25rem] select-none px-0.5 text-center text-[15px] leading-none text-neutral-900"
                aria-hidden
              >
                …
              </span>
            )
          }

          const active = item === currentPage
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`第 ${item} 页`}
              aria-current={active ? 'page' : undefined}
              className={`min-w-[2rem] px-1 text-center font-gallery text-[15px] tabular-nums transition-all duration-200 ${
                active
                  ? 'rounded-[5px] border border-neutral-200/90 bg-white px-2 py-1.5 font-medium text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'font-normal text-neutral-900 hover:text-neutral-500'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className={arrowClass}
        disabled={!canNext}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="下一页"
      >
        <Chevron direction="right" />
      </button>
    </nav>
  )
}
