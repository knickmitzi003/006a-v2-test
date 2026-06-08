import { formatPosts, FORMAT_POST_LIST_OPTIONS } from '@/src/lib/blog/format/post'
import { getPosts } from '@/src/lib/notion/getBlogData'
import { Post } from '@/src/types/blog'
import { ApiScope } from '@/src/types/notion'

let postsInflight: Promise<Post[]> | null = null

export function clearGalleryPostsCache(): void {
  postsInflight = null
}

/** 仅在同一次请求内去重；不跨 ISR 请求缓存，避免保存后仍返回旧列表 */
export async function loadGalleryCachedPublishedPosts(): Promise<Post[]> {
  if (postsInflight) {
    return postsInflight
  }

  postsInflight = (async () => {
    const raw = await getPosts(ApiScope.Archive)
    return (await formatPosts(raw, FORMAT_POST_LIST_OPTIONS)).filter(
      (p) => p.status === 'Published'
    )
  })().finally(() => {
    postsInflight = null
  })

  return postsInflight
}
