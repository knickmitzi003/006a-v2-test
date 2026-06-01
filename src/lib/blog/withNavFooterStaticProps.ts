import { SharedNavFooterStaticProps } from '@/src/types/blog'
import { GetStaticPropsContext } from 'next'
import { resolveActiveTheme } from '@/src/themes/getActiveTheme'
import { getCachedNavFooter } from '../notion/getCachedMem'

async function buildSharedProps(
  navPages: SharedNavFooterStaticProps['props']['navPages'],
  siteTitle: SharedNavFooterStaticProps['props']['siteTitle'],
  logo: SharedNavFooterStaticProps['props']['logo']
): Promise<SharedNavFooterStaticProps['props']> {
  const activeTheme = await resolveActiveTheme()
  return {
    navPages,
    siteTitle,
    siteSubtitle: null,
    logo,
    activeTheme,
  }
}

export function withNavFooterStaticProps(
  getStaticPropsFunc?: (
    context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => Promise<SharedNavFooterStaticProps>
) {
  return async (
    context: GetStaticPropsContext
  ): Promise<SharedNavFooterStaticProps> => {
    const { navPages, siteTitle, logo } = await getCachedNavFooter()
    const sharedProps = await buildSharedProps(navPages, siteTitle, logo)

    if (getStaticPropsFunc == null) {
      return { props: sharedProps }
    }

    const result = await getStaticPropsFunc(context, { props: sharedProps })
    if (result && 'props' in result && result.props) {
      // 始终以 Notion 为准；页面内 catch 不得把主题写成 anzifan
      result.props.activeTheme = await resolveActiveTheme(
        result.props.activeTheme ?? sharedProps.activeTheme
      )
    }
    return result
  }
}
