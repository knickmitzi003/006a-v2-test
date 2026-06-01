import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { LargeTitle } from '../components/LargeTitle'
import { BlogLayoutPure } from '../components/layout/BlogLayout'
import ContainerLayout from '../components/post/ContainerLayout'
import { WidgetCollection } from '../components/section/WidgetCollection'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { loadHomeWidgets } from '../lib/blog/loadHomeWidgets'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { addSubTitle } from '../lib/util'
import { NextPageWithLayout, Page, SharedNavFooterStaticProps } from '../types/blog'
import { BlockResponse } from '../types/notion'
import { GalleryArticlePage } from '@/src/themes/gallery/GalleryArticlePage'

const { ABOUT } = CONFIG.DEFAULT_SPECIAL_PAGES

const About: NextPage<{
  blocks: BlockResponse[]
  title: string
  page: Page | null
  widgets: {
    [key: string]: unknown
  }
  activeTheme?: string
}> = ({ blocks, title, page, widgets, activeTheme }) => {
  if (activeTheme === 'gallery') {
    const heading = page?.nav || title
    return (
      <GalleryArticlePage
        title={heading}
        blocks={blocks}
        breadcrumbLabel={heading}
        excerpt={page?.title && page.title !== page.nav ? page.title : null}
      />
    )
  }

  return (
    <>
      <ContainerLayout>
        <LargeTitle className="mb-4" title={title} />
        <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
          <BlockRender blocks={blocks} />
        </div>
        <div className="mt-6" data-aos="fade-up">
          {widgets && <WidgetCollection widgets={widgets} />}
        </div>
      </ContainerLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    addSubTitle(sharedPageStaticProps.props, ABOUT)
    const page =
      sharedPageStaticProps.props.navPages.find(
        (p) => p.slug === ABOUT
      ) ?? null

    const blocks = await getAllBlocks(page?.id ?? '')
    const formattedBlocks = await formatBlocks(blocks)

    const formattedWidgets = await loadHomeWidgets()

    const safeBlocks = formattedBlocks || []
    const safeTitle = page?.title ?? page?.nav ?? 'About'

    return {
      props: {
        ...sharedPageStaticProps.props,
        page,
        blocks: safeBlocks,
        title: safeTitle,
        widgets: formattedWidgets || {},
      },
    }
  }
)

const withNavPage = withNavFooter(About)

;(withNavPage as NextPageWithLayout).getLayout = (page) => {
  if ((page.props as { activeTheme?: string })?.activeTheme === 'gallery') {
    return page
  }
  return <BlogLayoutPure>{page}</BlogLayoutPure>
}

export default withNavPage
