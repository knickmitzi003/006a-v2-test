'use client'

import { useCallback, useEffect, useState } from 'react'
import { preloadGalleryImages } from '@/src/lib/gallery/preloadGalleryImages'
import { GALLERY_POST_FETCH_LIMIT } from './galleryConstants'
import { GalleryGridImage } from './GalleryGridImage'
import { GalleryGridLoader } from './GalleryGridLoader'
import { GalleryLightbox } from './GalleryLightbox'

type GalleryApiImage = {
  id: string
  url: string
  thumb_url: string | null
  sort_order: number
}

type GalleryApiResponse = {
  success: boolean
  configured?: boolean
  total?: number
  images?: GalleryApiImage[]
  hasMore?: boolean
  error?: string
}

type GalleryImageGridProps = {
  postSlug: string
}

async function fetchAllGalleryImages(
  postSlug: string
): Promise<{ images: GalleryApiImage[]; total: number }> {
  const limit = GALLERY_POST_FETCH_LIMIT
  let page = 1
  let hasMore = true
  let total = 0
  const all: GalleryApiImage[] = []

  while (hasMore) {
    const res = await fetch(
      `/api/gallery/${encodeURIComponent(postSlug)}?page=${page}&limit=${limit}`
    )
    const data: GalleryApiResponse = await res.json()
    if (!data.success) {
      throw new Error(data.error || '加载图库失败')
    }
    const batch = data.images || []
    all.push(...batch)
    total = data.total ?? all.length
    hasMore = !!data.hasMore && batch.length > 0
    page += 1
    if (page > 200) break
  }

  return { images: all, total }
}

export function GalleryImageGrid({ postSlug }: GalleryImageGridProps) {
  const [images, setImages] = useState<GalleryApiImage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [contentReady, setContentReady] = useState(false)

  const loadGallery = useCallback(async () => {
    setLoading(true)
    setContentReady(false)
    setError('')
    setLightboxIndex(null)

    try {
      const { images: allImages, total: count } =
        await fetchAllGalleryImages(postSlug)

      if (allImages.length === 0 && count === 0) {
        setActive(false)
        setImages([])
        setTotal(0)
        return
      }

      const sources = allImages.map((img) => img.thumb_url || img.url)
      await preloadGalleryImages(sources)

      setImages(allImages)
      setTotal(count)
      setActive(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setActive(false)
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [postSlug])

  useEffect(() => {
    let cancelled = false
    loadGallery().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [loadGallery])

  useEffect(() => {
    if (loading) {
      setContentReady(false)
      return
    }
    const frame = requestAnimationFrame(() => setContentReady(true))
    return () => cancelAnimationFrame(frame)
  }, [loading])

  if (loading) {
    return <GalleryGridLoader />
  }

  if (!active) {
    if (error) {
      return (
        <p className="py-10 text-center text-sm text-red-500">{error}</p>
      )
    }
    return null
  }

  return (
    <div
      className={`gallery-grid-panel mb-10 ${contentReady ? 'gallery-grid-panel--ready' : ''}`}
    >
      <p className="mb-5 font-gallery text-[14px] text-neutral-500">
        共 {total} 张
      </p>
      {error ? (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {images.map((img, index) => (
          <GalleryGridImage
            key={img.id}
            src={img.thumb_url || img.url}
            index={index}
            onOpen={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      <GalleryLightbox
        open={lightboxIndex !== null}
        images={images}
        index={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
        }
        onNext={() =>
          setLightboxIndex((i) =>
            i !== null && i < images.length - 1 ? i + 1 : i
          )
        }
      />
    </div>
  )
}

/** 供父组件判断是否应隐藏 Notion 正文块 */
export function useGalleryHasImages(postSlug: string): {
  ready: boolean
  hasGallery: boolean
} {
  const [ready, setReady] = useState(false)
  const [hasGallery, setHasGallery] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/gallery/${encodeURIComponent(postSlug)}?page=1&limit=1`)
      .then((r) => r.json())
      .then((d: GalleryApiResponse) => {
        if (cancelled) return
        setHasGallery(!!d.success && (d.total || 0) > 0)
      })
      .catch(() => {
        if (!cancelled) setHasGallery(false)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [postSlug])

  return { ready, hasGallery }
}
