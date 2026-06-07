import type { NextApiRequest, NextApiResponse } from 'next'
import {
  clearContentBuildCaches,
  collectAllRevalidatePaths,
  collectShellRevalidatePaths,
  revalidateMany,
} from '@/src/lib/blog/contentRevalidation'

type RevalidateBody = {
  secret?: string
  path?: string | string[]
  scope?: 'full'
}

function readSecret(req: NextApiRequest): string | undefined {
  if (req.method === 'GET') {
    const value = req.query.secret
    return Array.isArray(value) ? value[0] : value
  }
  const body = (req.body ?? {}) as RevalidateBody
  return body.secret
}

function readPaths(req: NextApiRequest): string[] | null {
  if (req.method === 'GET') {
    const value = req.query.path
    if (!value) return null
    return Array.isArray(value) ? value.map(String) : [String(value)]
  }
  const body = (req.body ?? {}) as RevalidateBody
  if (!body.path) return null
  return Array.isArray(body.path) ? body.path : [body.path]
}

function readScope(req: NextApiRequest): string | undefined {
  if (req.method === 'GET') {
    const value = req.query.scope
    return Array.isArray(value) ? value[0] : value
  }
  return (req.body as RevalidateBody | undefined)?.scope
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const expectedSecret =
    process.env.REVALIDATE_SECRET || process.env.MY_SECRET_TOKEN
  const providedSecret = readSecret(req)

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    clearContentBuildCaches()

    const explicitPaths = readPaths(req)
    const scope = readScope(req)
    const paths =
      explicitPaths ??
      (scope === 'full'
        ? await collectAllRevalidatePaths()
        : collectShellRevalidatePaths())

    const results = await revalidateMany(res, paths)
    const failed = results.filter((item) => !item.ok)

    return res.status(200).json({
      revalidated: failed.length === 0,
      total: results.length,
      failed: failed.length,
      results,
    })
  } catch (error) {
    console.error('revalidate error:', error)
    return res.status(500).json({
      message: 'Error revalidating',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
