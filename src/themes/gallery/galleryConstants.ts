import CONFIG from '@/blog.config'

export const GALLERY_SIDEBAR_WIDTH = 260

/** 首页每页文章数（4 列 × 3 行） */
export const GALLERY_HOME_PAGE_SIZE = 12

/** 分类 / 标签列表每页条数（4 列 × 6 行） */
export const GALLERY_LIST_PAGE_SIZE = 24

/** 文章内页图库：API 单次最多拉取条数（内页会循环拉取直至全部） */
export const GALLERY_POST_FETCH_LIMIT = 48

/** 首屏转圈至少展示时长（ms），给图库预加载留足时间 */
export const MIN_GALLERY_LOADER_MS = 1000

export const GALLERY_LOGIN_URL = CONFIG.GALLERY_LOGIN_URL || '#'

export const GALLERY_LOGO_SRC = '/themes/gallery/logo.png'

/** 侧栏导航自定义 PNG（替换默认 SVG） */
export const GALLERY_NAV_ICON_HOME = '/themes/gallery/nav/home.png'
export const GALLERY_NAV_ICON_LISTS = '/themes/gallery/nav/lists.png'
export const GALLERY_NAV_ICON_PARODIES = '/themes/gallery/nav/parodies.png'
/** Album → 使用说明（/about） */
export const GALLERY_NAV_ICON_GUIDE = '/themes/gallery/nav/guide.png'
export const GALLERY_NAV_ICON_MODELS = '/themes/gallery/nav/models.png'

export const GALLERY_FAVICON_32 = '/themes/gallery/favicon-32.png'
export const GALLERY_FAVICON_16 = '/themes/gallery/favicon-16.png'
export const GALLERY_FAVICON_BUST = 'v=5'
