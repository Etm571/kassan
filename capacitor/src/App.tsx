import { useEffect, useState } from 'react'

export default function WebSocketClient() {
  const [message, setMessage] = useState('')
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.50.124:PORT')

    ws.onopen = () => {
      ws.send('Hej från mobilen!')
    }

    ws.onmessage = (event) => {
      setMessage(`Svar från servern: ${event.data}`)
    }

    ws.onerror = (err) => {
      console.error('WebSocket-fel:', err)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div>
      <h2>WebSocket-anslutning</h2>
      <p>{message}</p>
    </div>
  )
}