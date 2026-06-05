/** 内页图库全量加载中的居中转圈（无文案） */
export function GalleryGridLoader() {
  return (
    <div
      className="gallery-grid-loader mb-10 flex min-h-[min(52vh,420px)] items-center justify-center py-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="加载中"
    >
      <div className="gallery-loader-orbit relative size-12" aria-hidden>
        <span className="gallery-loader-orbit__track absolute inset-0 rounded-full border-2 border-neutral-200" />
        <span className="gallery-loader-orbit__ring absolute inset-0 rounded-full border-2 border-transparent border-t-neutral-900 border-r-neutral-700" />
        <span className="gallery-loader-orbit__ring-inner absolute inset-[9px] rounded-full border-2 border-transparent border-b-neutral-400 border-l-neutral-300" />
      </div>
    </div>
  )
}
