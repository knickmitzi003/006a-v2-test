-- 爬虫元数据队列：爬虫写入（兰空图链已并入元数据），Blog 定时拉取并创建 Post + 图库
-- 仅适配 Gallery 主题站点（图链写入 gallery_images，首张图链写入 Notion cover）

create table if not exists public.crawler_ingest_queue (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  source_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed', 'skipped')),
  title text not null,
  slug text not null,
  excerpt text,
  category text,
  tags text,
  download text,
  download_size text,
  download_count text,
  content text,
  image_urls jsonb not null default '[]'::jsonb,
  notion_page_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint crawler_ingest_queue_site_source_key unique (site_id, source_id)
);

create index if not exists idx_crawler_ingest_queue_pending
  on public.crawler_ingest_queue (site_id, created_at)
  where status = 'pending';

create or replace function public.set_crawler_ingest_queue_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_crawler_ingest_queue_updated_at on public.crawler_ingest_queue;
create trigger trg_crawler_ingest_queue_updated_at
  before update on public.crawler_ingest_queue
  for each row
  execute function public.set_crawler_ingest_queue_updated_at();

alter table public.crawler_ingest_queue enable row level security;

comment on table public.crawler_ingest_queue is
  '爬虫待入库队列：爬虫 upsert pending 行；Blog cron 消费并写 Notion + galleries';

comment on column public.crawler_ingest_queue.source_id is
  '源站稳定 ID（URL 或 hash），同 site 唯一；重复推送时 upsert 并置 pending';
comment on column public.crawler_ingest_queue.image_urls is
  '兰空图链 JSON 数组，顺序即图库 sort_order；[0] 用作 Notion cover';
