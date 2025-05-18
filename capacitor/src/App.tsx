import { useEffect, useState } from 'react'
import ScannerView from './views/scannerView';

function VäntarKomponent() {
  return <div>Väntar på meddelande från servern...</div>
}

export default function WebSocketClient() {
  const [messageReceived, setMessageReceived] = useState(false)

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.50.124:8080')

    ws.onopen = () => {
      ws.send('Hej från mobilen!')
    }

    ws.onmessage = () => {
      setMessageReceived(true)
    }

    ws.onerror = (err) => {
      console.error('WebSocket-fel:', err)
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div>
      {messageReceived ? <ScannerView /> : <VäntarKomponent />}
    </div>
  )
}
