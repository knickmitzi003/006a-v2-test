/** Vercel Serverless 请求体硬上限约 4.5MB，留余量走代理 */
const PROXY_SAFE_BYTES = 3.5 * 1024 * 1024

function isLocalDevHost() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

async function readResponseBody(res) {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    const msg = json.message || json.error || ''
    if (/csrf/i.test(msg)) {
      const err = new Error(
        '兰空 CSRF 校验失败：请勿在浏览器直传 Bearer Token。本地请走服务端代理；线上大图将自动改用临时上传凭证。'
      )
      err.code = 'LSKY_CSRF'
      throw err
    }
    return { json, text }
  } catch (e) {
    if (e.code === 'LSKY_CSRF') throw e
    if (/request entity too large|payload too large|413|FUNCTION_PAYLOAD/i.test(text)) {
      const err = new Error('VERCEL_PAYLOAD_TOO_LARGE')
      err.raw = text
      throw err
    }
    throw new Error(text.slice(0, 200) || `HTTP ${res.status}`)
  }
}

function extractLskyUrl(data) {
  return data?.data?.links?.url || data?.url || ''
}

async function uploadViaProxy(file) {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      'content-type': file.type || 'application/octet-stream',
      'x-file-name': encodeURIComponent(file.name || 'image.png'),
    },
    body: file,
    credentials: 'same-origin',
  })
  const { json } = await readResponseBody(res)
  if (!json.success) throw new Error(json.error || '上传失败')
  return json.url
}

/** 浏览器直传兰空：使用临时 token（form 字段），不带 Authorization */
async function uploadViaTempToken(file) {
  const credRes = await fetch('/api/admin/lsky-temp-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds: 300 }),
    credentials: 'same-origin',
  })
  const { json: cred } = await readResponseBody(credRes)
  if (!cred.success) throw new Error(cred.error || '无法获取兰空上传凭证')

  const form = new FormData()
  form.append('file', file, file.name || 'image.png')
  form.append('token', cred.token)

  let uploadRes
  try {
    uploadRes = await fetch(cred.uploadUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
    })
  } catch (_) {
    throw new Error(
      '浏览器无法直连兰空（可能被 CORS 拦截）。请在兰空 Nginx 为博客域名开启跨域。'
    )
  }

  const { json: lskyJson } = await readResponseBody(uploadRes)
  if (!uploadRes.ok || lskyJson.status === false) {
    throw new Error(lskyJson.message || lskyJson.error || '兰空直传失败')
  }
  const url = extractLskyUrl(lskyJson)
  if (!url) throw new Error('兰空未返回图片 URL')
  return url
}

/**
 * 智能上传：
 * - 本地开发：始终服务端代理（无 Vercel 4.5MB 限制，且避免浏览器 Bearer 直传触发 CSRF）
 * - 线上小图：服务端代理
 * - 线上大图：临时 token 浏览器直传兰空
 */
export async function uploadImageToLsky(file) {
  if (!file) throw new Error('未选择文件')

  if (isLocalDevHost()) {
    return uploadViaProxy(file)
  }

  if (file.size > PROXY_SAFE_BYTES) {
    return uploadViaTempToken(file)
  }

  try {
    return await uploadViaProxy(file)
  } catch (e) {
    if (e.message === 'VERCEL_PAYLOAD_TOO_LARGE') {
      return uploadViaTempToken(file)
    }
    throw e
  }
}
