'use client'

import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { useRouter } from 'next/router'

/**
 * 卡片点击后的「单卡加载态」：
 * 文章内页按需 ISR（fallback blocking）首次生成会现场调用 Notion，存在秒级延迟。
 * 点击封面后在被点的那张卡片上显示加载动画，避免「点了没反应」的错觉。
 */
export function useGalleryNavLoading() {
  const router = useRouter()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  useEffect(() => {
    const done = () => setLoadingKey(null)
    router.events.on('routeChangeComplete', done)
    router.events.on('routeChangeError', done)
    return () => {
      router.events.off('routeChangeComplete', done)
      router.events.off('routeChangeError', done)
    }
  }, [router.events])

  const startNav = useCallback(
    (key: string) => (e: MouseEvent) => {
      // 新标签页 / 修饰键 / 非左键点击不会在本页导航，无需加载态
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        ('button' in e && e.button !== 0)
      ) {
        return
      }
      setLoadingKey(key)
    },
    []
  )

  const isLoading = useCallback(
    (key: string) => loadingKey === key,
    [loadingKey]
  )

  return { isLoading, startNav }
}

/** 覆盖在封面上的轻量加载动画（半透明遮罩 + 旋转环），需父级为 relative */
export function GalleryCardLoading() {
  return (
    <span
      className="gallery-card-loading pointer-events-none absolute inset-0 z-[3] flex items-center justify-center bg-black/25"
      aria-hidden="true"
    >
      <span className="gallery-card-spinner" />
    </span>
  )
}
