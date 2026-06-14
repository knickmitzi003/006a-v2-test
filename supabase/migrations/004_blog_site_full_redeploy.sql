-- 全量刷新（Vercel 重部署）冷却时间，按商户 site_id 记录
alter table public.blog_site_settings
  add column if not exists last_full_redeploy_at timestamptz;

comment on column public.blog_site_settings.last_full_redeploy_at is
  '上次触发 Vercel 全量重部署时间（24h 内不可重复触发）';
