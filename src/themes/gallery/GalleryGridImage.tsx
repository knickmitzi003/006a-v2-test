'use client'

type GalleryGridImageProps = {
  src: string
  index: number
  onOpen: () => void
}

export function GalleryGridImage({
  src,
  index,
  onOpen,
}: GalleryGridImageProps) {
  const delay = Math.min(index, 11) * 40

  return (
    <button
      type="button"
      data-gallery-index={index}
      onClick={onOpen}
      className="gallery-grid-enter-item group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100 text-left ring-0 transition-shadow hover:ring-2 hover:ring-neutral-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="eager"
        decoding="async"
      />
    </button>
  )
}
