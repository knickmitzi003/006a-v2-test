import {
  mapWithConcurrency,
  uploadImageToLsky,
} from '@/src/lib/admin/lskyClientUpload'

const UPLOAD_CONCURRENCY = 4

export function createPendingImageBlock(file) {
  const previewUrl = URL.createObjectURL(file)
  return {
    id: Date.now() + Math.random(),
    type: 'image',
    content: previewUrl,
    pendingFile: file,
    pwd: '',
    url: '',
    uploading: false,
    error: '',
  }
}

export function revokeBlockPendingMedia(block) {
  if (!block) return
  if (block.type === 'image' && block.pendingFile && block.content?.startsWith('blob:')) {
    URL.revokeObjectURL(block.content)
  }
  if (block.type === 'lock') {
    ;(block.pendingImageFiles || []).forEach(({ url }) => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    })
  }
}

export function revokePendingEditorMedia(blocks) {
  ;(blocks || []).forEach(revokeBlockPendingMedia)
}

export function countPendingEditorMedia(blocks) {
  let n = 0
  for (const b of blocks || []) {
    if (b.type === 'image' && b.pendingFile) n += 1
    if (b.type === 'lock') n += (b.pendingImageFiles || []).length
  }
  return n
}

export function isLockImagePending(block, url) {
  return (block.pendingImageFiles || []).some((p) => p.url === url)
}

/** 提交 Notion 前剥离内部字段 */
export function serializeBlocksForSave(blocks) {
  return (blocks || []).map((b) => ({
    type: b.type,
    content: b.content || '',
    pwd: b.pwd || '',
    url: b.url || '',
    images: b.images || [],
    bold: !!b.bold,
    italic: !!b.italic,
    color: b.color || 'default',
  }))
}

export function blocksToMarkdown(blocks) {
  return (blocks || [])
    .map((b) => {
      if (b.type === 'h1') return `# ${b.content}`
      if (b.type === 'note') return `\`${b.content}\``
      if (b.type === 'quote') {
        return (b.content || '').split(/\r?\n/).map((l) => `> ${l}`).join('\n')
      }
      if (b.type === 'link') {
        return b.url ? `[${b.content || b.url}](${b.url})` : b.content || ''
      }
      if (b.type === 'lock') {
        const imgLines = (b.images || []).map((u) => `![](${u})`)
        const parts = []
        if (b.content?.trim()) parts.push(b.content)
        imgLines.forEach((l) => parts.push(l))
        return `:::lock ${b.pwd}\n${parts.join('\n')}\n:::`
      }
      if (b.type === 'image') return b.content ? `![](${b.content})` : ''
      return b.content
    })
    .filter((s) => s !== '')
    .join('\n\n')
}

export function resolveAutoCover(blocks) {
  const first = (blocks || []).find(
    (b) =>
      b.type === 'image' &&
      b.content &&
      /^https?:\/\//i.test(b.content) &&
      !/\.(mp4|mov|webm|ogg|mkv)(\?|$)/i.test(b.content)
  )
  return first?.content || ''
}

/**
 * 发布/保存前：上传正文 pending 图片，返回可写入 Notion 的块列表
 */
export async function flushEditorBlocksMedia(blocks, { onProgress } = {}) {
  const list = blocks || []
  const tasks = []

  list.forEach((block, blockIndex) => {
    if (block.type === 'image' && block.pendingFile) {
      tasks.push({ kind: 'image', blockIndex, file: block.pendingFile })
    }
    if (block.type === 'lock') {
      ;(block.pendingImageFiles || []).forEach((entry) => {
        tasks.push({
          kind: 'lock',
          blockIndex,
          blobUrl: entry.url,
          file: entry.file,
        })
      })
    }
  })

  const uploadMap = new Map()
  let done = 0

  if (tasks.length > 0) {
    await mapWithConcurrency(tasks, UPLOAD_CONCURRENCY, async (task) => {
      const url = await uploadImageToLsky(task.file)
      if (task.kind === 'image') {
        uploadMap.set(`image-${task.blockIndex}`, url)
      } else {
        uploadMap.set(`lock-${task.blockIndex}-${task.blobUrl}`, url)
      }
      done += 1
      onProgress?.({ done, total: tasks.length })
    })
  }

  return list.map((block, blockIndex) => {
    if (block.type === 'image' && block.pendingFile) {
      const url = uploadMap.get(`image-${block.blockIndex}`)
      if (!url) throw new Error('正文图片上传未完成，请重试')
      if (block.content?.startsWith('blob:')) URL.revokeObjectURL(block.content)
      return {
        ...block,
        content: url,
        pendingFile: undefined,
        uploading: false,
        error: '',
      }
    }

    if (block.type === 'lock' && (block.pendingImageFiles || []).length > 0) {
      const newImages = (block.images || []).map((imgUrl) => {
        const uploaded = uploadMap.get(`lock-${blockIndex}-${imgUrl}`)
        if (uploaded) {
          if (imgUrl.startsWith('blob:')) URL.revokeObjectURL(imgUrl)
          return uploaded
        }
        return imgUrl
      })
      return {
        ...block,
        images: newImages,
        pendingImageFiles: [],
        lockUploading: false,
        error: '',
      }
    }

    return block
  })
}
