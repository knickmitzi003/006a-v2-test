import { ProfileWidget } from '../widget/ProfileWidget'
import { StatsWidget } from '../widget/StatsWidget'

export const WidgetCollection = ({
  widgets,
}: {
  widgets: { [key: string]: any }
}) => {
  return (
    <div
      className="mb-6 grid grid-cols-2 gap-4 md:gap-8 lg:gap-10"
      data-aos="fade-up"
    >
      {/* 左侧：Profile 组件 (保持不变) */}
      <ProfileWidget data={widgets.profile} />
      
      {/* 右侧：魔改公告卡（数据须为 slug=announcement 的文章，由 loadHomeWidgets 注入） */}
      <StatsWidget data={widgets.announcement} />
    </div>
  )
}
