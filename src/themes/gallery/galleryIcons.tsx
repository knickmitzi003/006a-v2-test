/**
 * 侧栏导航图标：在此文件修改 SVG，或在 GalleryNavIcons 中改为 <img src="..." />。
 * 各菜单项使用哪个 icon 键，见 galleryNav.ts 里 item.icon。
 */
import { ReactElement, SVGProps } from 'react'
import { GalleryNavItem } from './galleryNav'

const iconProps: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'shrink-0',
  'aria-hidden': true,
}

/** Gallery Epic 黑色线性图标 */
export const GalleryNavIcons: Record<GalleryNavItem['icon'], () => ReactElement> = {
  home: () => (
    <svg {...iconProps}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  lists: () => (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  cosers: () => (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  parodies: () => (
    <svg {...iconProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  models: () => (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
      <path d="M12 6v1" />
    </svg>
  ),
}

export function getGalleryNavIcon(icon: GalleryNavItem['icon']) {
  return GalleryNavIcons[icon]
}
