/**
 * Vercel Serverless Function — Jira CORS Proxy
 *
 * Forwards requests to Jira Cloud using an OAuth Bearer token.
 * The target Jira site is identified by the x-cloud-id header.
 *
 * Required headers from the client:
 *   Authorization  — Bearer <access_token>
 *   x-cloud-id     — the Atlassian cloud ID (from token exchange)
 */

const ALLOWED_ORIGIN_RE = /^https:\/\/([\w-]+\.github\.io|localhost(:\d+)?)$/
const JIRA_API_BASE = 'https://api.atlassian.com/ex/jira'

export default async function handler(req, res) {
  const origin = req.headers['origin'] ?? ''
  const cors = buildCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  const authorization = req.headers['authorization']
  const cloudId = req.headers['x-cloud-id']

  if (!authorization || !cloudId) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Missing Authorization or x-cloud-id header' }))
    return
  }

  if (!authorization.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Only Bearer token auth is supported' }))
    return
  }

  // Build target: https://api.atlassian.com/ex/jira/\{cloudId\}/rest/api/3/...
  // req.url is the path after /rest, e.g. /api/3/myself
  const target = `${JIRA_API_BASE}/${cloudId}/rest${req.url}`

  const body =
    ['GET', 'HEAD', 'DELETE'].includes(req.method)
      ? undefined
      : await readBody(req)

  let jiraRes
  try {
    jiraRes = await fetch(target, {
      method: req.method,
      headers: {
        authorization,
        'content-type': req.headers['content-type'] ?? 'application/json',
        accept: req.headers['accept'] ?? 'application/json',
      },
      body,
    })
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Upstream fetch failed: ' + err.message }))
    return
  }

  const skip = new Set(['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'])
  const outHeaders = { ...cors }
  for (const [k, v] of jiraRes.headers.entries()) {
    if (!skip.has(k.toLowerCase())) outHeaders[k] = v
  }

  res.writeHead(jiraRes.status, outHeaders)
  const buf = await jiraRes.arrayBuffer()
  res.end(Buffer.from(buf))
}

function buildCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGIN_RE.test(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, x-cloud-id',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
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
