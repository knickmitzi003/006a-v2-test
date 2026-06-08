import { formatPosts, FORMAT_POST_LIST_OPTIONS } from '@/src/lib/blog/format/post'
import { getPosts } from '@/src/lib/notion/getBlogData'
import { Post } from '@/src/types/blog'
import { ApiScope } from '@/src/types/notion'

let postsCache: { at: number; posts: Post[] } | null = null
const POSTS_CACHE_MS = 60_000

export function clearGalleryPostsCache(): void {
  postsCache = null
}

export async function loadGalleryCachedPublishedPosts(): Promise<Post[]> {
  if (postsCache && Date.now() - postsCache.at < POSTS_CACHE_MS) {
    return postsCache.posts
  }
  const raw = await getPosts(ApiScope.Archive)
  const posts = (await formatPosts(raw, FORMAT_POST_LIST_OPTIONS)).filter(
    (p) => p.status === 'Published'
  )
  postsCache = { at: Date.now(), posts }
  return posts
}
