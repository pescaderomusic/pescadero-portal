const { google } = require('googleapis')
const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')

// Load env vars manually
const envFile = fs.readFileSync('.env.local', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim()
})

const CLIENT_ID = env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.readonly'],
})

console.log('\n✅ Open this URL in your browser:\n')
console.log(authUrl)
console.log('\n⏳ Waiting for callback...\n')

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  if (parsed.pathname === '/api/auth/google/callback' && parsed.query.code) {
    const { tokens } = await oauth2Client.getToken(parsed.query.code)
    res.end('<h2>✅ Success! You can close this tab and go back to your terminal.</h2>')
    server.close()

    console.log('\n✅ Got your refresh token! Add this to your .env.local:\n')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\nAlso add to Vercel environment variables with the same name.\n')
  }
})

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000...')
})
