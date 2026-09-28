/**
 * Vercel Serverless Function — Jira CORS Proxy
 *
 * Receives all /rest/* requests from the GitHub Pages app,
 * forwards them to the user's Jira Cloud instance, and returns
 * the response with CORS headers so the browser accepts it.
 *
 * Required headers from the client:
 *   x-jira-url     — e.g. https://your-domain.atlassian.net
 *   Authorization  — Basic <base64(email:apiToken)>
 */

const ALLOWED_ORIGIN_RE = /^https:\/\/([\w-]+\.github\.io|localhost(:\d+)?)$/

export default async function handler(req, res) {
  const origin = req.headers['origin'] ?? ''
  const cors = buildCorsHeaders(origin)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }

  const jiraUrl = req.headers['x-jira-url']
  const authorization = req.headers['authorization']

  if (!jiraUrl || !authorization) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Missing x-jira-url or Authorization header' }))
    return
  }

  // Validate Jira URL
  let parsed
  try {
    parsed = new URL(jiraUrl)
    if (!parsed.hostname.endsWith('.atlassian.net')) throw new Error()
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'x-jira-url must be an atlassian.net domain' }))
    return
  }

  // Build target: swap origin for jiraUrl, keep path + query
  const target = new URL(req.url, jiraUrl)

  // Read body for mutating methods
  const body =
    ['GET', 'HEAD', 'DELETE'].includes(req.method)
      ? undefined
      : await readBody(req)

  let jiraRes
  try {
    jiraRes = await fetch(target.toString(), {
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

  // Forward response headers (minus hop-by-hop)
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
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, x-jira-url',
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
