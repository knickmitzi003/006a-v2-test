import { GalleryAdBanner as GalleryAdBannerData } from '@/src/lib/gallery/loadGalleryAdBanner'

type GalleryAdBannerProps = {
  banner: GalleryAdBannerData
}

/** Gallery Epic 风格：主内容区底部细条横幅 */
export function GalleryAdBanner({ banner }: GalleryAdBannerProps) {
  const { url, imageSrc, promoText } = banner

  return (
    <aside className="shrink-0 border-t border-neutral-200 bg-white">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group relative flex h-10 w-full items-center overflow-hidden"
      >
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {promoText ? (
          <div className="relative z-10 flex h-full w-full items-center bg-black/45 px-4 transition-colors group-hover:bg-black/55 sm:px-6">
            <p className="truncate font-gallery text-[11px] font-medium tracking-wide text-white">
              {promoText}
            </p>
          </div>
        ) : (
          <span className="sr-only">广告</span>
        )}
      </a>
    </aside>
  )
}
