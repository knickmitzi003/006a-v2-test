import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { BlockRender } from '@/src/components/blocks/BlockRender'
import { BlogLayoutPure } from '@/src/components/layout/BlogLayout'
import ContainerLayout from '@/src/components/post/ContainerLayout'
import { LargeTitle } from '@/src/components/LargeTitle'
import { Section404 } from '@/src/components/section/Section404'
import withNavFooter from '@/src/components/withNavFooter'
import { GALLERY_DOWNLOAD_INSTRUCTIONS_SLUG } from '@/src/lib/gallery/galleryDownloadPaths'
import { formatBlocks } from '@/src/lib/blog/format/block'
import { withNavFooterStaticProps } from '@/src/lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '@/src/lib/notion/getBlocks'
import { addSubTitle } from '@/src/lib/util'
import { GalleryArticlePage } from '@/src/themes/gallery/GalleryArticlePage'
import { NextPageWithLayout, Page, SharedNavFooterStaticProps } from '@/src/types/blog'
import { BlockResponse } from '@/src/types/notion'

const DownloadInstructionsPage: NextPage<{
  blocks: BlockResponse[]
  title: string
  page: Page | null
  activeTheme?: string
}> = ({ blocks, title, page, activeTheme }) => {
  if (!page) return <Section404 />

  if (activeTheme === 'gallery') {
    const heading = page.nav || title
    return (
      <GalleryArticlePage
        title={heading}
        blocks={blocks}
        breadcrumbLabel={heading}
        excerpt={page.title && page.title !== page.nav ? page.title : null}
      />
    )
  }

  return (
    <ContainerLayout>
      <LargeTitle className="mb-4" title={title} />
      <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
        <BlockRender blocks={blocks} />
      </div>
    </ContainerLayout>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    addSubTitle(sharedPageStaticProps.props, GALLERY_DOWNLOAD_INSTRUCTIONS_SLUG)
    const page =
      sharedPageStaticProps.props.navPages.find(
        (p) => p.slug === GALLERY_DOWNLOAD_INSTRUCTIONS_SLUG
      ) ?? null

    const blocks = await getAllBlocks(page?.id ?? '')
    const formattedBlocks = await formatBlocks(blocks)

    const safeTitle = page?.title ?? page?.nav ?? '下载说明'

    return {
      props: {
        ...sharedPageStaticProps.props,
        page,
        blocks: formattedBlocks || [],
        title: safeTitle,
      },
    }
  }
)

const withNavPage = withNavFooter(DownloadInstructionsPage)

;(withNavPage as NextPageWithLayout).getLayout = (page) => {
  if ((page.props as { activeTheme?: string })?.activeTheme === 'gallery') {
    return page
  }
  return <BlogLayoutPure>{page}</BlogLayoutPure>
}

export default withNavPage
