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
