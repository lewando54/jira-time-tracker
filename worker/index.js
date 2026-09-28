/**
 * Cloudflare Worker — Jira CORS Proxy
 *
 * Forwards requests to a Jira Cloud instance, adding CORS headers so the
 * app can run from any origin (including GitHub Pages).
 *
 * Required request headers sent by the app:
 *   x-jira-url     — the Jira base URL, e.g. https://your-domain.atlassian.net
 *   Authorization  — Basic <base64(email:token)>
 *
 * Deploy:
 *   cd worker && npx wrangler deploy
 */

const ALLOWED_ORIGIN_PATTERN = /^https:\/\/([\w-]+\.github\.io|localhost(:\d+)?)$/

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') ?? ''

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      })
    }

    const jiraUrl = request.headers.get('x-jira-url')
    const authorization = request.headers.get('Authorization')

    if (!jiraUrl || !authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing x-jira-url or Authorization header' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      )
    }

    // Validate the Jira URL is an atlassian.net domain
    let parsed
    try {
      parsed = new URL(jiraUrl)
      if (!parsed.hostname.endsWith('.atlassian.net')) {
        throw new Error('Not an atlassian.net domain')
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid or disallowed x-jira-url' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      )
    }

    // Build target URL: replace origin with jiraUrl, keep the path + query
    const incoming = new URL(request.url)
    const target = new URL(incoming.pathname + incoming.search, jiraUrl)

    // Forward the request to Jira
    const forwardHeaders = new Headers()
    forwardHeaders.set('Authorization', authorization)
    forwardHeaders.set('Content-Type', request.headers.get('Content-Type') ?? 'application/json')
    forwardHeaders.set('Accept', request.headers.get('Accept') ?? 'application/json')

    const jiraResponse = await fetch(target.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    })

    // Stream response back with CORS headers
    const responseHeaders = new Headers(jiraResponse.headers)
    for (const [k, v] of Object.entries(corsHeaders(origin))) {
      responseHeaders.set(k, v)
    }
    // Remove hop-by-hop headers
    responseHeaders.delete('transfer-encoding')
    responseHeaders.delete('connection')

    return new Response(jiraResponse.body, {
      status: jiraResponse.status,
      statusText: jiraResponse.statusText,
      headers: responseHeaders,
    })
  },
}

function corsHeaders(origin) {
  // Allow GitHub Pages domains and localhost for dev
  const allowedOrigin = ALLOWED_ORIGIN_PATTERN.test(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, x-jira-url',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}
