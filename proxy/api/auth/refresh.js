/**
 * POST /auth/refresh
 *
 * Exchanges a refresh token for a new access token.
 * Called automatically by the frontend when a 401 is received.
 *
 * Body: { refresh_token: string }
 * Returns: { access_token, refresh_token, expires_in }
 */

const ALLOWED_ORIGIN_RE = /^https:\/\/([\w-]+\.github\.io|localhost(:\d+)?)$/

export default async function handler(req, res) {
  const origin = req.headers['origin'] ?? ''
  const cors = buildCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, cors)
    res.end()
    return
  }

  const clientId = process.env.VITE_CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET

  if (!clientId || !clientSecret) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Proxy not configured' }))
    return
  }

  let body
  try {
    const raw = await readBody(req)
    body = JSON.parse(raw.toString())
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Invalid JSON body' }))
    return
  }

  const { refresh_token } = body
  if (!refresh_token) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Missing refresh_token' }))
    return
  }

  const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token,
    }),
  })

  const tokenData = await tokenRes.json()

  if (!tokenRes.ok) {
    res.writeHead(tokenRes.status, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: tokenData.error_description ?? 'Refresh failed' }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json', ...cors })
  res.end(JSON.stringify({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? refresh_token,
    expires_in: tokenData.expires_in,
  }))
}

function buildCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGIN_RE.test(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
