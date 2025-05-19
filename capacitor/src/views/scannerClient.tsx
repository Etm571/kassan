import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


export default function ScannerClient() {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const ws = new WebSocket(`wss://${import.meta.env.VITE_WEBSOCKET}?ngrok-skip-browser-warning=true`)

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({ type: "register-scanner" }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "assign") {
          const user = data.user
          navigate("/start-scanning", { state: { name: user.name, userId: user.userId } })
        } else {
          setMessages((prev) => [...prev, event.data])
        }
      } catch {
        setMessages((prev) => [...prev, event.data])
      }
    }

    ws.onclose = () => {
      setConnected(false)
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err)
    }

    return () => {
      ws.close()
    }
  }, [navigate])

  return (
    <div>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>

      <div>
        <h3>Messages received:</h3>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
