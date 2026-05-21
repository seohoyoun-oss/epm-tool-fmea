import http from 'http'
import handler from './api/fmea.js'

const PORT = 3001

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Add Express-compatible helpers that api/fmea.js calls
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    try {
      req.body = JSON.parse(body || '{}')
    } catch {
      req.body = {}
    }
    handler(req, res)
  })
})

server.listen(PORT, () => {
  console.log(`API dev server listening on http://localhost:${PORT}`)
})
