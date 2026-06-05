import { fetchUrlPreview } from '@/src/lib/blog/fetchUrlPreview'
import { getWidgets } from '@/src/lib/notion/getBlogData'
import { readRichTextPlain } from '@/src/lib/notion/readProperty'

export type GalleryAdBanner = {
  url: string
  imageSrc: string
  promoText: string | null
}

const GALLERY_AD_SLUG = 'gallery-ad'

let buildCache: GalleryAdBanner | null | undefined

function readCoverUrl(
  cover: { type: string; url?: string | null } | undefined
): string | null {
  if (!cover || cover.type !== 'url') return null
  const src = cover.url?.trim()
  return src?.startsWith('http') ? src : null
}

export async function loadGalleryAdBanner(): Promise<GalleryAdBanner | null> {
  if (buildCache !== undefined) return buildCache

  const widgets = await getWidgets()
  const raw = widgets.find(
    (w) => readRichTextPlain(w.properties.slug) === GALLERY_AD_SLUG
  )
  if (!raw) {
    buildCache = null
    return null
  }

  const url = readRichTextPlain(raw.properties.excerpt) || ''
  if (!url.startsWith('http')) {
    buildCache = null
    return null
  }

  const coverOverride = readCoverUrl(
    raw.properties.cover as { type: string; url?: string | null }
  )

  let imageSrc = coverOverride
  if (!imageSrc) {
    const preview = await fetchUrlPreview(url)
    imageSrc = preview.image?.startsWith('http') ? preview.image : null
  }

  if (!imageSrc) {
    buildCache = null
    return null
  }

  const rawTitle = readRichTextPlain(raw.properties.title) || ''
  const promoText =
    rawTitle && rawTitle !== '广告位' ? rawTitle : null

  buildCache = {
    url,
    imageSrc,
    promoText,
  }
  return buildCache
}
