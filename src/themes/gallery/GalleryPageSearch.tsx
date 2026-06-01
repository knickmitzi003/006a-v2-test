import { FormEvent } from 'react'

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

type GalleryPageSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 为 true 时占位与输入文字居中（Epic 列表页风格） */
  centered?: boolean
}

/** Gallery Epic 列表页：居中圆角搜索框，图标在右侧 */
export function GalleryPageSearch({
  value,
  onChange,
  placeholder = '搜索',
  centered = true,
}: GalleryPageSearchProps) {
  const onSubmit = (e: FormEvent) => e.preventDefault()

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-[420px] px-6"
      role="search"
    >
      <label htmlFor="gallery-page-search" className="sr-only">
        {placeholder}
      </label>
      <div className="relative">
        <input
          id="gallery-page-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-full border border-neutral-200 bg-white py-3 pr-12 text-[15px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 ${
            centered ? 'pl-12 text-center' : 'pl-5'
          }`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <SearchIcon />
        </span>
      </div>
    </form>
  )
}
