import Head from 'next/head'
import { useEffect } from 'react'
import {
  GALLERY_FAVICON_16,
  GALLERY_FAVICON_32,
  GALLERY_FAVICON_BUST,
} from './galleryConstants'

/** anzifan / touchgal 等默认主题标签图标（勿与 Gallery 混用） */
export const DEFAULT_FAVICON_32 = '/favicon-32x32.png'
export const DEFAULT_FAVICON_16 = '/favicon-16x16.png'
export const DEFAULT_APPLE = '/apple-touch-icon.png'

const GALLERY_ICON_32 = `${GALLERY_FAVICON_32}?${GALLERY_FAVICON_BUST}`
const GALLERY_ICON_16 = `${GALLERY_FAVICON_16}?${GALLERY_FAVICON_BUST}`

function removeIconLinks() {
  document
    .querySelectorAll(
      "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
    )
    .forEach((el) => el.remove())
}

function appendIcon(rel: string, href: string, sizes?: string, type = 'image/png') {
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  link.type = type
  if (sizes) link.setAttribute('sizes', sizes)
  document.head.appendChild(link)
}

function applyGalleryFavicons() {
  removeIconLinks()
  appendIcon('icon', GALLERY_ICON_32, '32x32')
  appendIcon('icon', GALLERY_ICON_16, '16x16')
  appendIcon('shortcut icon', GALLERY_ICON_32)
  appendIcon('apple-touch-icon', GALLERY_ICON_32)
}

function applyDefaultFavicons() {
  removeIconLinks()
  appendIcon('icon', DEFAULT_FAVICON_32, '32x32')
  appendIcon('icon', DEFAULT_FAVICON_16, '16x16')
  appendIcon('shortcut icon', DEFAULT_FAVICON_32)
  appendIcon('apple-touch-icon', DEFAULT_APPLE)
}

/** 按 activeTheme 切换标签图标；仅 gallery 使用独立 PNG，不写入全局 cookie */
export function GalleryFaviconLinks({ activeTheme }: { activeTheme?: string }) {
  const isGallery = activeTheme === 'gallery'

  useEffect(() => {
    if (isGallery) {
      applyGalleryFavicons()
    } else {
      applyDefaultFavicons()
    }
  }, [isGallery])

  if (isGallery) {
    return (
      <Head>
        <link key="g32" rel="icon" type="image/png" sizes="32x32" href={GALLERY_ICON_32} />
        <link key="g16" rel="icon" type="image/png" sizes="16x16" href={GALLERY_ICON_16} />
        <link key="g-short" rel="shortcut icon" href={GALLERY_ICON_32} />
        <link key="g-apple" rel="apple-touch-icon" href={GALLERY_ICON_32} />
      </Head>
    )
  }

  return (
    <Head>
      <link
        key="default-apple"
        rel="apple-touch-icon"
        sizes="180x180"
        href={DEFAULT_APPLE}
      />
      <link
        key="default-icon-32"
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={DEFAULT_FAVICON_32}
      />
      <link
        key="default-icon-16"
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={DEFAULT_FAVICON_16}
      />
      <link key="default-short" rel="shortcut icon" href={DEFAULT_FAVICON_32} />
    </Head>
  )
}

/** 后台管理页专用默认图标 */
export function AdminFaviconLinks() {
  useEffect(() => {
    applyDefaultFavicons()
  }, [])

  return (
    <Head>
      <link rel="icon" type="image/png" sizes="32x32" href={DEFAULT_FAVICON_32} />
      <link rel="icon" type="image/png" sizes="16x16" href={DEFAULT_FAVICON_16} />
      <link rel="shortcut icon" href={DEFAULT_FAVICON_32} />
    </Head>
  )
}
