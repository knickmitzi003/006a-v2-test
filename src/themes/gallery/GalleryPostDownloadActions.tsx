'use client'

import { useState } from 'react'
import { GalleryDownloadModal } from './GalleryDownloadModal'

type GalleryPostDownloadActionsProps = {
  postTitle: string
  downloadContent: string
}

/** 下载页右侧上半：点击后弹出文章专属下载信息 */
export function GalleryPostDownloadActions({
  postTitle,
  downloadContent,
}: GalleryPostDownloadActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md bg-black px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900 sm:w-auto sm:min-w-[200px]"
      >
        下载
      </button>
      <GalleryDownloadModal
        open={open}
        postTitle={postTitle}
        content={downloadContent}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
