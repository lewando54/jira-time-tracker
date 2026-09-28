import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import * as http from 'http'
import * as https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vite plugin: dynamic Jira proxy for local development.
 * Reads x-jira-url and Authorization from each request and forwards
 * it server-side — no CORS issues in dev.
 * In production requests go to VITE_PROXY_URL (Cloudflare Worker) instead.
 */
function jiraProxyPlugin(): Plugin {
  return {
    name: 'jira-dynamic-proxy',
    configureServer(server) {
      server.middlewares.use('/rest', (req, res) => {
        const jiraUrl = req.headers['x-jira-url'] as string | undefined
        const authorization = req.headers['authorization'] as string | undefined

        if (!jiraUrl || !authorization) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing x-jira-url or authorization header' }))
          return
        }

        let parsed: URL
        try {
          parsed = new URL(jiraUrl)
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid x-jira-url header' }))
          return
        }

        const targetPath = '/rest' + (req.url ?? '')

        const options: https.RequestOptions = {
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: targetPath,
          method: req.method,
          headers: {
            authorization,
            'content-type': req.headers['content-type'] ?? 'application/json',
            accept: req.headers['accept'] ?? 'application/json',
            'user-agent': 'jira-time-tracker-dev-proxy/1.0',
          },
        }

        const transport = parsed.protocol === 'https:' ? https : http

        const proxyReq = transport.request(options, (proxyRes) => {
          const forwardHeaders: Record<string, string | string[]> = {}
          for (const [key, value] of Object.entries(proxyRes.headers)) {
            if (value !== undefined && !['transfer-encoding', 'connection', 'keep-alive'].includes(key)) {
              forwardHeaders[key] = value as string | string[]
            }
          }
          forwardHeaders['access-control-allow-origin'] = 'http://localhost:5173'
          forwardHeaders['access-control-allow-credentials'] = 'true'
          res.writeHead(proxyRes.statusCode ?? 200, forwardHeaders)
          proxyRes.pipe(res)
        })

        proxyReq.on('error', (err) => {
          console.error('[jira-proxy] Error:', err.message)
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' })
          }
          res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }))
        })

        req.pipe(proxyReq)
      })
    },
  }
}

export default defineConfig({
  // GitHub Pages serves the app from /jira-time-tracker/ (the repo name).
  // Vite ignores this in dev mode automatically.
  base: '/jira-time-tracker/',

  plugins: [tailwindcss(), react(), jiraProxyPlugin()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
