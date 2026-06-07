import { buildFilteredArchiveFeed } from '@/src/lib/blog/buildArchiveFeed'
import { initialCategory } from '@/src/lib/blog/format/category'
import { initialTag } from '@/src/lib/blog/format/tag'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1)
    const tagId = (req.query.tag as string) || initialTag.id
    const categoryId = (req.query.category as string) || initialCategory.id

    const feed = await buildFilteredArchiveFeed({
      page,
      tagId,
      categoryId,
    })

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    return res.status(200).json({ success: true, ...feed })
  } catch (error) {
    console.error('archive feed error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
