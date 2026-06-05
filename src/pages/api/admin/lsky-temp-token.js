import { verifyAdminRequest } from '@/src/lib/admin/verifyAdminRequest'
import { getLskyAuthorization, getLskyBase } from '@/src/lib/admin/lskyServer'

/**
 * 为已登录后台签发兰空「临时上传 token」（小 JSON 请求，可绕过 Vercel 4.5MB 限制）
 * 浏览器用 form 字段 token 直传兰空，勿带 Authorization，避免 CSRF。
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: '仅支持 POST' })
  }

  if (!verifyAdminRequest(req)) {
    return res.status(401).json({ success: false, error: '未授权，请重新登录后台' })
  }

  const authorization = getLskyAuthorization()
  if (!authorization) {
    return res.status(500).json({ success: false, error: '服务端未配置 LSKY_TOKEN' })
  }

  const base = getLskyBase()
  const seconds = Math.min(Math.max(parseInt(req.body?.seconds || '300', 10) || 300, 60), 3600)

  try {
    const tokenRes = await fetch(`${base}/api/v1/images/tokens`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ num: '1', seconds: String(seconds) }),
    })

    const text = await tokenRes.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return res.status(502).json({
        success: false,
        error: '兰空返回了非预期内容，请检查 LSKY_TOKEN 或站点地址',
        raw: text.slice(0, 300),
      })
    }

    if (!tokenRes.ok || data.status === false) {
      return res.status(tokenRes.status || 502).json({
        success: false,
        error: data.message || '获取兰空临时上传凭证失败',
      })
    }

    const tempToken = data?.data?.tokens?.[0]?.token
    if (!tempToken) {
      return res.status(502).json({ success: false, error: '兰空未返回临时上传 token' })
    }

    return res.status(200).json({
      success: true,
      uploadUrl: `${base}/api/v1/upload`,
      token: tempToken,
      expiredAt: data?.data?.tokens?.[0]?.expired_at || null,
    })
  } catch (e) {
    console.error('/api/admin/lsky-temp-token', e)
    return res.status(500).json({ success: false, error: e?.message || '获取上传凭证失败' })
  }
}
