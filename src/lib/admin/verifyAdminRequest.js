/**
 * 校验后台请求（与 middleware 逻辑一致：Basic 或 internal_auth Cookie）
 */
export function verifyAdminRequest(req) {
  const validUser = process.env.AUTH_USER || 'admin'
  const validPass = process.env.AUTH_PASS || '123456'

  const basic = req.headers.authorization
  if (basic) {
    try {
      const b64 = basic.replace(/^Basic\s+/i, '')
      const [user, pwd] = Buffer.from(b64, 'base64').toString().split(':')
      if (user === validUser && pwd === validPass) return true
    } catch (_) {
      /* ignore */
    }
  }

  const cookie = req.cookies?.internal_auth
  if (cookie) {
    try {
      const [user, pwd] = Buffer.from(cookie, 'base64').toString().split(':')
      if (user === validUser && pwd === validPass) return true
    } catch (_) {
      /* ignore */
    }
  }

  return false
}
