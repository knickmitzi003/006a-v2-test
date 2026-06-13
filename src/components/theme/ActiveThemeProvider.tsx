import { resolveThemeId } from '@/src/themes/registry'
import { ThemeId } from '@/src/themes/types'
import { useRouter } from 'next/router'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const SYNC_PARAM = '_theme_sync'

const ActiveThemeContext = createContext<ThemeId>('anzifan')

export function useActiveTheme(): ThemeId {
  return useContext(ActiveThemeContext)
}

export function ActiveThemeProvider({
  initialTheme,
  isAdminRoute,
  children,
}: {
  initialTheme?: string | null
  isAdminRoute: boolean
  children: ReactNode
}) {
  const router = useRouter()
  const staticTheme = useMemo(
    () => resolveThemeId(initialTheme || 'anzifan'),
    [initialTheme]
  )
  const [liveTheme, setLiveTheme] = useState<ThemeId>(staticTheme)

  // 仅当本页静态主题比当前 liveTheme「更新」时才采纳：
  // - 首屏 SSR 时两者相同，安全水合
  // - 跨页导航若命中过期 ISR 页（activeTheme 仍是旧主题），不要用它覆盖已解析的 liveTheme，
  //   否则会先闪一下旧主题再被接口纠正回来。
  const hasResolvedLive = useRef(false)
  useEffect(() => {
    if (!hasResolvedLive.current) {
      setLiveTheme(staticTheme)
    }
  }, [staticTheme])

  useEffect(() => {
    if (isAdminRoute) return

    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/public/active-theme', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { themeId?: ThemeId }
        if (data.themeId) {
          hasResolvedLive.current = true
          setLiveTheme(data.themeId)
        }
      } catch (error) {
        console.warn('[ActiveThemeProvider] fetch failed', error)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isAdminRoute, staticTheme, router.asPath])

  useEffect(() => {
    if (isAdminRoute || typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (!params.has(SYNC_PARAM)) return
    params.delete(SYNC_PARAM)
    const qs = params.toString()
    const next = qs ? `${router.pathname}?${qs}` : router.pathname
    router.replace(next, undefined, { shallow: true })
  }, [isAdminRoute, liveTheme, router])

  return (
    <ActiveThemeContext.Provider value={liveTheme}>
      {children}
    </ActiveThemeContext.Provider>
  )
}
