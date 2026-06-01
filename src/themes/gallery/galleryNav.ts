import CONFIG from '@/blog.config'

export type GalleryNavItem = {
  /** Epic 展示文案（与参考站一致） */
  label: string
  href: string
  icon: 'home' | 'lists' | 'cosers' | 'parodies' | 'models'
}

export type GalleryNavSection = {
  /** 分组标题；首页项无标题 */
  title?: string
  items: GalleryNavItem[]
}

const { ARCHIVE, TAG, CATEGORY, FREINDS, ABOUT } = CONFIG.DEFAULT_SPECIAL_PAGES

const guidePath =
  (CONFIG as { GALLERY_GUIDE_PATH?: string }).GALLERY_GUIDE_PATH ||
  `/${ABOUT}`
const morePath =
  (CONFIG as { GALLERY_MORE_PATH?: string }).GALLERY_MORE_PATH || `/${FREINDS}`

/**
 * Gallery Epic 侧栏结构（见用户标注截图）：
 * Home → 首页
 * Cosplay/Lists → 分类 | Cosers → 标签 | Parodies → 归档
 * Album/使用说明 → 关于页 | Models → 更多内容
 */
export const GALLERY_NAV_SECTIONS: GalleryNavSection[] = [
  {
    items: [{ label: 'Home', href: '/', icon: 'home' }],
  },
  {
    title: 'Cosplay',
    items: [
      { label: 'Lists', href: `/${CATEGORY}`, icon: 'lists' },
      { label: 'Cosers', href: `/${TAG}`, icon: 'cosers' },
      { label: 'Parodies', href: `/${ARCHIVE}/1`, icon: 'parodies' },
    ],
  },
  {
    title: 'Album',
    items: [
      { label: '使用说明', href: guidePath, icon: 'lists' },
      { label: 'Models', href: morePath, icon: 'models' },
    ],
  },
]
