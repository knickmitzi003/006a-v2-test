import { getBlogSiteIdOrNull } from '@/src/lib/gallery/blogSite'
import { getSupabaseAdmin } from '@/src/lib/supabase/admin'

/** 爬虫入库仅服务 Gallery 主题站点 */
export async function isGalleryThemeActive(): Promise<boolean> {
  const envTheme = process.env.NEXT_PUBLIC_THEME?.trim().toLowerCase()
  if (envTheme === 'gallery') return true

  const sb = getSupabaseAdmin()
  const siteId = getBlogSiteIdOrNull()
  if (!sb || !siteId) return false

  const { data, error } = await sb
    .from('blog_site_settings')
    .select('theme_code')
    .eq('site_id', siteId)
    .maybeSingle()

  if (error) throw error
  return String(data?.theme_code || '').toLowerCase() === 'gallery'
}
