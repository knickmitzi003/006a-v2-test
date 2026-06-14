import CONFIG from '@/blog.config'

/**
 * 站点 SEO 集中配置。
 *
 * 说明：
 * - 这里的关键词 / 描述只会出现在 <head> 的 meta 标签、结构化数据中，
 *   不会渲染到前端可见区域，仅用于搜索引擎（Google / Bing 等）抓取。
 * - 站点公网地址优先读取 NEXT_PUBLIC_SITE_URL（客户端与服务端均可用），
 *   用于 canonical / Open Graph / sitemap / robots。未配置时会优雅降级。
 */

// 平台相关长尾关键词（用于 meta keywords，不在页面正文显示）
export const SITE_KEYWORDS: string[] = [
  'PRO+',
  'PRO BLOG',
  'PRO+ 博客',
  'PRO+一站式寄售',
  'PRO+ 一站式寄售',
  'PRO+博客服务',
  '免费博客服务',
  '免费博客',
  '个人博客',
  '免费个人博客',
  '个人主页',
  '博客搭建',
  '一键搭建博客',
  'Notion 博客',
  '一站式寄售',
  '免费建站',
  '博客平台',
]

export const SITE_KEYWORDS_CONTENT = SITE_KEYWORDS.join(', ')

// 默认站点描述（自然融入关键词，作为没有专属描述页面的兜底）
export const DEFAULT_SITE_DESCRIPTION =
  'PRO+ 一站式寄售与免费博客服务。PRO BLOG 基于 Notion 提供免费、易用的个人博客服务，帮助你快速搭建个人博客与个人主页，几分钟即可上线属于自己的免费个人博客。'

export const DEFAULT_SITE_NAME = 'PRO+ Blog'

// 默认分享/封面图（Open Graph / Twitter Card 兜底）
export const DEFAULT_OG_IMAGE: string =
  CONFIG.DEFAULT_POST_COVER ||
  'https://img.x1file.top/disk_r/2026/05/31/6a1bf12f468b6.jpg'

/** 去除结尾斜杠 */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/**
 * 客户端安全的站点地址：仅使用 NEXT_PUBLIC_SITE_URL，
 * 保证 SSR 与 CSR 渲染结果一致（避免 hydration 不匹配）。
 * 未配置时返回空字符串，调用方应据此跳过 canonical / og:url 输出。
 */
export function getPublicSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
  return raw ? stripTrailingSlash(raw) : ''
}

/**
 * 服务端解析站点地址（用于 sitemap.xml / robots.txt 等仅在服务端运行的路由）。
 * 优先级：NEXT_PUBLIC_SITE_URL → BLOG_PUBLIC_URL → 请求 Host 头 → VERCEL_URL。
 */
export function resolveServerSiteUrl(headers?: {
  host?: string | string[]
  'x-forwarded-host'?: string | string[]
  'x-forwarded-proto'?: string | string[]
}): string {
  const envUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BLOG_PUBLIC_URL ||
    ''
  ).trim()
  if (envUrl) return stripTrailingSlash(envUrl)

  const pick = (v?: string | string[]) =>
    Array.isArray(v) ? v[0] : v
  const host = pick(headers?.['x-forwarded-host']) || pick(headers?.host)
  const proto = pick(headers?.['x-forwarded-proto']) || 'https'
  if (host) return `${proto}://${host.split(',')[0].trim()}`

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return ''
}

/** 拼接绝对 URL（base 为空时返回相对路径） */
export function absoluteUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}
