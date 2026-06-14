import Head from 'next/head'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
  SITE_KEYWORDS_CONTENT,
  absoluteUrl,
  getPublicSiteUrl,
} from '@/src/lib/seo/seoConfig'

type SeoPost = {
  title?: string
  excerpt?: string
  cover?: string
  date?: string
  category?: string
  tags?: string[]
  slug?: string
}

type SeoHeadProps = {
  siteName?: string
  /** 页面级副标题（文章标题 / 分类名等） */
  pageSubtitle?: string
  /** 当前路径（来自 router.asPath），用于 canonical / og:url */
  path?: string
  /** 文章页数据（存在时输出 BlogPosting 结构化数据 + article OG） */
  post?: SeoPost | null
  /** 后台路由：输出 noindex，避免被搜索引擎收录 */
  isAdmin?: boolean
}

/**
 * 统一的 SEO <head> 输出：标题、描述、关键词、robots、canonical、
 * Open Graph、Twitter Card 与 JSON-LD 结构化数据。
 * 这些内容仅出现在 <head>，不会显示在前端可见区域。
 */
export default function SeoHead({
  siteName,
  pageSubtitle,
  path,
  post,
  isAdmin,
}: SeoHeadProps) {
  const name = (siteName || '').trim() || DEFAULT_SITE_NAME
  const sub = (pageSubtitle || '').trim()
  const title = sub && sub !== name ? `${sub} | ${name}` : name

  const baseUrl = getPublicSiteUrl()
  const cleanPath = (path || '/').split('#')[0].split('?')[0] || '/'
  const canonical = baseUrl ? absoluteUrl(baseUrl, cleanPath) : ''

  const description =
    (post?.excerpt || '').trim() || DEFAULT_SITE_DESCRIPTION
  const image = (post?.cover || '').trim() || DEFAULT_OG_IMAGE
  const ogType = post ? 'article' : 'website'

  // 关键词：平台长尾词 + 当前文章的分类/标签（若有）
  const keywords = [
    post?.category,
    ...(post?.tags || []),
    SITE_KEYWORDS_CONTENT,
  ]
    .filter(Boolean)
    .join(', ')

  // 后台页面：仅输出标题 + noindex，避免被收录
  if (isAdmin) {
    return (
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
    )
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
    ...(baseUrl ? { url: baseUrl } : {}),
  }

  const articleLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title || title,
        description,
        image: image ? [image] : undefined,
        ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
        ...(canonical ? { mainEntityOfPage: canonical } : {}),
        ...(post.category ? { articleSection: post.category } : {}),
        ...(post.tags && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
        author: { '@type': 'Organization', name },
        publisher: { '@type': 'Organization', name },
      }
    : null

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="zh_CN" />
      {image ? <meta property="og:image" content={image} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {post?.date ? (
        <meta property="article:published_time" content={post.date} />
      ) : null}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      {/* 结构化数据 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      {articleLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      ) : null}
    </Head>
  )
}
