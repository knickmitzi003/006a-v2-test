'use client'

import { BlockRender } from '@/src/components/blocks/BlockRender'
import { BlockResponse } from '@/src/types/notion'
import { GalleryImageGrid, useGalleryHasImages } from './GalleryImageGrid'
import {
  filterGalleryBodyBlocks,
  hasGalleryBodyContent,
} from './galleryPostBlocks'
import { galleryProseClass } from './galleryFonts'

type GalleryPostContentProps = {
  postSlug: string
  blocks: BlockResponse[]
}

const proseWrapClass = `${galleryProseClass} rounded-sm border border-neutral-200 bg-white px-6 py-8 md:px-10`

export function GalleryPostContent({ postSlug, blocks }: GalleryPostContentProps) {
  const { ready, hasGallery } = useGalleryHasImages(postSlug)
  const bodyBlocks = filterGalleryBodyBlocks(blocks, hasGallery)
  const showBody = hasGalleryBodyContent(blocks, hasGallery)

  return (
    <>
      <GalleryImageGrid postSlug={postSlug} />

      {ready && showBody ? (
        <div className={hasGallery ? 'mt-8' : ''}>
          <div className={proseWrapClass}>
            <BlockRender blocks={bodyBlocks} />
          </div>
        </div>
      ) : null}

      {ready && !hasGallery && !showBody ? (
        <p className="py-6 text-center text-[13px] text-neutral-400">
          暂无正文与图库。可在后台添加正文块，或在「图库（Gallery · Supabase）」上传作品图集。
        </p>
      ) : null}
    </>
  )
}
