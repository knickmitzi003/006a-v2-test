import { MIN_GALLERY_LOADER_MS } from '@/src/themes/gallery/galleryConstants'

export async function preloadGalleryImages(
  sources: string[],
  minDurationMs = MIN_GALLERY_LOADER_MS
): Promise<void> {
  const started = Date.now()

  const preloadOne = (src: string) =>
    new Promise<void>((resolve) => {
      if (!src) {
        resolve()
        return
      }
      const img = new Image()
      const done = () => resolve()
      img.onload = done
      img.onerror = done
      img.src = src
    })

  await Promise.all(sources.map(preloadOne))

  const elapsed = Date.now() - started
  if (elapsed < minDurationMs) {
    await new Promise((r) => setTimeout(r, minDurationMs - elapsed))
  }
}
