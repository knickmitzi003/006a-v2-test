-- 爬虫自动入库：后台可配置每日触发时刻（北京时间整点）
alter table public.blog_site_settings
  add column if not exists crawler_ingest_auto_enabled boolean not null default false,
  add column if not exists crawler_ingest_auto_hour smallint not null default 3
    check (crawler_ingest_auto_hour >= 0 and crawler_ingest_auto_hour <= 23);

comment on column public.blog_site_settings.crawler_ingest_auto_enabled is
  '是否启用每日自动爬虫入库（由 cron 每小时检查）';
comment on column public.blog_site_settings.crawler_ingest_auto_hour is
  '自动入库北京时间整点（0-23）';
