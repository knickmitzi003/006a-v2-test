type GalleryGridSkeletonProps = {
  showCaption?: boolean
}

/** 图库首屏：居中高级感转圈加载 */
export function GalleryGridSkeleton({ showCaption = true }: GalleryGridSkeletonProps) {
  return (
    <div
      className="gallery-grid-loader mb-10 flex min-h-[min(52vh,420px)] flex-col items-center justify-center py-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="图库加载中"
    >
      <div className="gallery-spinner" aria-hidden />
      {showCaption ? (
        <p className="mt-6 font-gallery text-[13px] tracking-[0.12em] text-neutral-400">
          正在加载图库
        </p>
      ) : null}
    </div>
  )
}
