import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendRequestLogger = () => ({
  name: 'backend-request-logger',
  configureServer(server) {
    server.middlewares.use('/__backend-request-log', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end()
        return
      }

      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })

      req.on('end', () => {
        try {
          const request = JSON.parse(body || '{}')
          const method = request.method || 'GET'
          const url = request.url || 'unknown-url'
          const retried = request.retried ? ' retry' : ''
          console.log(`[backend] ${method}${retried} ${url}`)
        } catch {
          console.log('[backend] request log parse failed')
        }

        res.statusCode = 204
        res.end()
      })
    })
  },
})

export default defineConfig({
  plugins: [
    react(),
    backendRequestLogger(),
  ],
  server: {
    port: 3000,
  }
})
