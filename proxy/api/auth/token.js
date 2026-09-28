/**
 * POST /auth/token
 *
 * Exchanges an OAuth authorization code for access + refresh tokens.
 * The Client Secret lives only here as a Vercel env var — never in the browser.
 *
 * Body: { code: string, redirectUri: string }
 * Returns: { access_token, refresh_token, expires_in, cloud_id, space_url }
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
    res.end(JSON.stringify({ error: 'Proxy not configured (missing env vars)' }))
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

  const { code, redirectUri } = body
  if (!code || !redirectUri) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Missing code or redirectUri' }))
    return
  }

  // Exchange code for tokens with Atlassian
  const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  const tokenData = await tokenRes.json()

  if (!tokenRes.ok) {
    res.writeHead(tokenRes.status, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: tokenData.error_description ?? 'Token exchange failed' }))
    return
  }

  // Fetch the accessible Jira sites for this user
  const sitesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
  })

  const sites = await sitesRes.json()

  if (!sitesRes.ok || !Array.isArray(sites) || sites.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'No accessible Jira sites found for this account' }))
    return
  }

  // Use the first site (most users have exactly one)
  const site = sites[0]

  res.writeHead(200, { 'Content-Type': 'application/json', ...cors })
  res.end(JSON.stringify({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    cloud_id: site.id,
    space_url: `https://${site.name}.atlassian.net`,
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
