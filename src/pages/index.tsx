import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import withNavFooter from '../components/withNavFooter'
import { formatPosts } from '../lib/blog/format/post'
import { loadHomeWidgets } from '../lib/blog/loadHomeWidgets'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { capHomePosts, BLOG_HOME_POSTS_MAX } from '../lib/blog/postLimits'
import { ANNOUNCEMENT_SLUG } from '../lib/blog/pinnedPosts'
import { getLimitPosts } from '../lib/notion/getDatabase'
import { Post, SharedNavFooterStaticProps } from '../types/blog'
import { ApiScope } from '../types/notion'
import { themeFromEnv } from '../themes/getActiveTheme'
import { getThemeHomeComponent } from '../themes/registry'
import { ThemeId } from '../themes/types'

const Home: NextPage<{
  posts: Post[]
  widgets: { [key: string]: unknown }
  activeTheme: ThemeId
}> = ({ posts, widgets, activeTheme, siteTitle, navPages }) => {
  const themeId = activeTheme || themeFromEnv() || 'anzifan'
  const HomeView = getThemeHomeComponent(themeId)
  return (
    <HomeView
      posts={posts}
      widgets={widgets}
      siteTitle={siteTitle}
      navPages={navPages}
    />
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    try {
      const postsRaw = await getLimitPosts(BLOG_HOME_POSTS_MAX, ApiScope.Archive)
      let allFormattedPosts = capHomePosts(await formatPosts(postsRaw))

      if (!allFormattedPosts || allFormattedPosts.length === 0) {
        const backupPosts = (sharedPageStaticProps.props.navPages as unknown as { type?: string; slug?: string }[]) || []
        allFormattedPosts = backupPosts.filter((p) => p.type === 'Post') as Post[]
      }

      const announcementPost =
        allFormattedPosts.find((p) => p.slug === ANNOUNCEMENT_SLUG) || null
      const filteredPosts = allFormattedPosts.filter(
        (p) => p.slug !== ANNOUNCEMENT_SLUG
      )

      const safeWidgets = await loadHomeWidgets({
        announcement: announcementPost,
      })

      const finalProps = JSON.parse(JSON.stringify(sharedPageStaticProps.props))
      const finalPosts = JSON.parse(JSON.stringify(filteredPosts))
      const finalWidgets = JSON.parse(JSON.stringify(safeWidgets || {}))

      return {
        props: {
          ...finalProps,
          posts: finalPosts,
          widgets: finalWidgets,
        },
        revalidate: 1,
      }
    } catch (e) {
      console.error('Index page build failed:', e)
      const base = JSON.parse(JSON.stringify(sharedPageStaticProps.props))
      return {
        props: {
          ...base,
          posts: [],
          widgets: {},
          // 保留 sharedPageStaticProps 中的 activeTheme，由 withNavFooter 末尾再次校正
        },
        revalidate: 1,
      }
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)
export default withNavPage
