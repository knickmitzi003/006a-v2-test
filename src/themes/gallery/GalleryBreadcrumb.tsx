import Link from 'next/link'
import { galleryInlineLinkClass } from './galleryFonts'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export const GalleryBreadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  if (!items.length) return null

  return (
    <nav
      className="font-gallery flex flex-wrap items-center gap-1.5 px-6 pt-5 text-[15px] leading-none antialiased"
      aria-label="面包屑"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span className="select-none text-neutral-300" aria-hidden>
                /
              </span>
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={galleryInlineLinkClass}
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-bold text-neutral-900">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
