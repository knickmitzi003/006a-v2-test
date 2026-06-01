import { TouchgalLayout } from '@/src/components/section/TouchgalLayout'
import { ComponentType } from 'react'
import { DefaultHome } from './anzifan/DefaultHome'
import { GalleryHome } from './gallery/GalleryHome'
import { ThemeHomeProps, ThemeId } from './types'

export const THEME_HOME: Record<ThemeId, ComponentType<ThemeHomeProps>> = {
  anzifan: DefaultHome,
  touchgal: TouchgalLayout as ComponentType<ThemeHomeProps>,
  gallery: GalleryHome,
}

/**
 * 新主题首页应使用 index 下发的 props.posts（已 cap 至 BLOG_HOME_POSTS_MAX），
 * 勿在主题内全量 getPosts。构建上限见 src/lib/blog/postLimits.ts
 */

/** 将 theme-config.excerpt 或内部主题 ID 解析为 ThemeId */
export function resolveThemeId(code: string | null | undefined): ThemeId {
  const c = (code || '').trim().toLowerCase()
  if (c === 'v2' || c === 'touchgal') return 'touchgal'
  if (c === 'gallery') return 'gallery'
  if (c === 'v1' || c === 'anzifan' || c === 'standard') return 'anzifan'
  return 'anzifan'
}

export function getThemeHomeComponent(themeId: ThemeId) {
  return THEME_HOME[themeId] ?? DefaultHome
}
