import { ApiFilter, ApiScope } from '@/src/types/notion'

export function combineScopeWithFilter(
  scope: ApiScope,
  extra: ApiFilter
): ApiFilter {
  const scopeFilter = filterSwitch(scope)
  if (!extra) return scopeFilter
  if (!scopeFilter) return extra
  return { and: [extra, scopeFilter] }
}

export const slugEqualsFilter = (slug: string): ApiFilter => ({
  property: 'slug',
  rich_text: { equals: slug },
})

/**
 * Notion 不接受 and: [slug, { or: [...] }]，须把 slug 并入每个 or 分支的 and 内。
 */
export function combineScopeWithSlugFilter(
  scope: ApiScope,
  slug: string
): ApiFilter {
  const slugFilter = slugEqualsFilter(slug)
  const scopeFilter = filterSwitch(scope)
  if (!scopeFilter) return slugFilter

  if ('or' in scopeFilter && Array.isArray(scopeFilter.or)) {
    return {
      or: scopeFilter.or.map((branch) => {
        if (branch && typeof branch === 'object' && 'and' in branch && branch.and) {
          return { and: [slugFilter, ...branch.and] }
        }
        return { and: [slugFilter, branch] }
      }),
    }
  }

  if ('and' in scopeFilter && Array.isArray(scopeFilter.and)) {
    return { and: [slugFilter, ...scopeFilter.and] }
  }

  return { and: [slugFilter, scopeFilter] }
}

export const filterSwitch = (scope: ApiScope) => {
  let filter: ApiFilter
  switch (scope) {
    case ApiScope.Home:
      filter = {
        and: [
          {
            property: 'status',
            status: {
              equals: 'Published',
            },
          },
        ],
      }
      break
    case ApiScope.Archive:
      filter = {
        or: [
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Published',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Post',
                },
              },
            ],
          },
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Hidden',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Post',
                },
              },
            ],
          },
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Published',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Piece',
                },
              },
            ],
          },
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Hidden',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Piece',
                },
              },
            ],
          },
        ],
      }
      break
    case ApiScope.Draft:
      filter = {
        or: [
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Draft',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Post',
                },
              },
            ],
          },
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Draft',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Piece',
                },
              },
            ],
          },
        ],
      }
      break
    case ApiScope.Page:
      filter = {
        or: [
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Published',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Page',
                },
              },
            ],
          },
          {
            and: [
              {
                property: 'status',
                status: {
                  equals: 'Hidden',
                },
              },
              {
                property: 'type',
                select: {
                  equals: 'Page',
                },
              },
            ],
          },
        ],
      }
      break
  }
  return filter
}
