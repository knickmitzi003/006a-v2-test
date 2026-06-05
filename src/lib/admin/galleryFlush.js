import {
  mapWithConcurrency,
  uploadGalleryImageToLsky,
} from '@/src/lib/admin/lskyClientUpload'

const UPLOAD_CONCURRENCY = 4

/** @typedef {{ id: string, status: 'remote', url: string }} RemoteGalleryItem */
/** @typedef {{ id: string, status: 'pending', file: File, previewUrl: string }} PendingGalleryItem */
/** @typedef {RemoteGalleryItem | PendingGalleryItem} GalleryItem */

export function remoteFromApiImage(img) {
  return {
    id: img.id || `remote-${img.url}`,
    status: 'remote',
    url: img.url,
  }
}

export function createPendingGalleryItem(file) {
  return {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    status: 'pending',
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

export function revokePendingGalleryItems(items) {
  ;(items || [])
    .filter((it) => it.status === 'pending' && it.previewUrl)
    .forEach((it) => URL.revokeObjectURL(it.previewUrl))
}

export function countPendingGalleryItems(items) {
  return (items || []).filter((it) => it.status === 'pending').length
}

export function galleryPreviewUrl(item) {
  if (!item) return ''
  return item.status === 'pending' ? item.previewUrl : item.url
}

async function persistGalleryUrls({ slug, postTitle, postNotionId, urls }) {
  const res = await fetch('/api/admin/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postSlug: slug,
      postNotionId: postNotionId || null,
      title: postTitle || null,
      images: urls.map((url) => ({ url })),
    }),
  })
  const d = await res.json()
  if (!d.success) throw new Error(d.error || '图库保存失败')
  return d
}

/** 仅同步已上图床的图片（手动保存排序；不含 pending） */
export async function persistGalleryRemote({
  slug,
  postTitle,
  postNotionId,
  items,
}) {
  const urls = (items || [])
    .filter((it) => it.status === 'remote')
    .map((it) => it.url)
  return persistGalleryUrls({ slug, postTitle, postNotionId, urls })
}

/**
 * 发布/保存成功后：按当前顺序上传 pending，写入 Supabase，返回全 remote 列表
 * @param {object} params
 * @param {GalleryItem[]} params.items
 * @param {(p: { done: number, total: number }) => void} [params.onProgress]
 */
export async function flushGalleryUploads({
  slug,
  postTitle,
  postNotionId,
  items,
  onProgress,
}) {
  const list = items || []
  const pendingEntries = list
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.status === 'pending')

  const uploadResults = new Map()

  if (pendingEntries.length > 0) {
    let done = 0
    await mapWithConcurrency(
      pendingEntries,
      UPLOAD_CONCURRENCY,
      async ({ item, index }) => {
        const url = await uploadGalleryImageToLsky(item.file)
        uploadResults.set(index, url)
        done += 1
        onProgress?.({ done, total: pendingEntries.length })
      }
    )
  }

  const finalUrls = list.map((item, index) => {
    if (item.status === 'remote') return item.url
    const url = uploadResults.get(index)
    if (!url) throw new Error('图库上传未完成，请重试')
    return url
  })

  await persistGalleryUrls({ slug, postTitle, postNotionId, urls: finalUrls })
  revokePendingGalleryItems(list)

  return finalUrls.map((url) => remoteFromApiImage({ url }))
}
