import {
  getFullRedeployStatus,
  triggerFullRedeploy,
} from '@/src/lib/admin/fullRedeploy'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const status = await getFullRedeployStatus()
      return res.status(200).json({ success: true, ...status })
    }

    if (req.method === 'POST') {
      await triggerFullRedeploy()
      const status = await getFullRedeployStatus()
      return res.status(200).json({
        success: true,
        message:
          '全量更新已触发，请等待3分钟后刷新BLOG，如存在问题请联系管理',
        ...status,
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isCooldown = /小时内仅可使用一次/.test(message)
    return res.status(isCooldown ? 429 : 500).json({
      success: false,
      error: message,
    })
  }
}
