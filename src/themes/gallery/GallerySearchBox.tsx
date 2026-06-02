import { useRouter } from 'next/router'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { readSearchQuery } from './gallerySearch'

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
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

function ClearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function GallerySearchBox() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipDebounceRef = useRef(false)

  const pushQuery = useCallback(
    (term: string) => {
      const query = { ...router.query }
      const trimmed = term.trim()
      if (trimmed) {
        query.q = trimmed
      } else {
        delete query.q
      }
      delete query.page

      const target = { pathname: '/', query }
      if (router.pathname === '/') {
        router.replace(target, undefined, { shallow: true, scroll: false })
      } else {
        router.push(target)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!router.isReady) return
    skipDebounceRef.current = true
    setValue(readSearchQuery(router.query.q))
  }, [router.isReady, router.query.q])

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const urlQ = readSearchQuery(router.query.q)
      if (value.trim() === urlQ) return
      pushQuery(value)
    }, 320)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, pushQuery, router.query.q])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushQuery(value)
  }

  const onClear = () => {
    setValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushQuery('')
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 px-2" role="search">
      <label htmlFor="gallery-search" className="sr-only">
        搜索文章标题或标签
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <SearchIcon />
        </span>
        <input
          id="gallery-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入关键词"
          autoComplete="off"
          className="font-gallery w-full rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-7 text-[12px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
            aria-label="清除搜索"
          >
            <ClearIcon />
          </button>
        ) : null}
      </div>
    </form>
  )
}
