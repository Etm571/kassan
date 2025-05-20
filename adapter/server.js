const express = require('express')
const cors = require('cors')
const http = require('http')
const WebSocket = require('ws')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors({
  origin: '*',
  methods: ['POST'],
  credentials: false
}))

app.use(bodyParser.json())


const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const scanners = new Map()

wss.on('connection', (ws, req) => {
  ws.id = uuidv4()
  ws.typ = 'scanner'

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)

      if (data.type === 'register-scanner') {
        scanners.set(ws.id, ws)
        console.log(`Scanner registrerad: ${ws.id}`)
      }
    } catch (err) {
      console.error('Felaktigt meddelande:', err)
    }
  })

  ws.on('close', () => {
    scanners.delete(ws.id)
    console.log(`Scanner borttagen: ${ws.id}`)
  })
})

app.post('/assign', (req, res) => {
  const { user } = req.body
  const [scannerId, scannerWs] = [...scanners.entries()][0] || []
  console.log('Tilldelar användare:', user, 'till scanner:', scannerId)

  if (!scannerWs) {
    return res.status(400).json({ fel: 'Ingen scanner tillgänglig' })
  }

  try {
    scannerWs.send(JSON.stringify({ type: 'assign', user }))
    return res.json({ skickadTill: scannerId })
  } catch (err) {
    return res.status(500).json({ fel: 'Kunde inte skicka till scanner' })
  }
})

server.listen(8080, () => {
  console.log('Servern lyssnar på port 8080')
})
