import type { NextApiRequest, NextApiResponse } from 'next'
import { getCrawlerQueueSummary } from '@/src/lib/ingest/crawlerQueueDb'
import { runCrawlerIngestJob } from '@/src/lib/ingest/runCrawlerIngestJob'

export const config = {
  maxDuration: 300,
}

function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false

  const auth = req.headers.authorization || ''
  if (auth === `Bearer ${secret}`) return true

  const header = req.headers['x-cron-secret']
  if (typeof header === 'string' && header === secret) return true

  return false
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  try {
    if (req.method === 'GET') {
      const summary = await getCrawlerQueueSummary()
      return res.status(200).json({ success: true, summary })
    }

    const result = await runCrawlerIngestJob(res)
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('crawler-ingest cron error:', error)
    return res.status(500).json({ success: false, error: message })
  }
}
