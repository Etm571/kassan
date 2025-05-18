import { useEffect, useState } from "react"

type AssignedUser = {
  name: string
  [key: string]: any
}

export default function ScannerClient() {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [assignedUser, setAssignedUser] = useState<AssignedUser | null>(null)

  useEffect(() => {
    const ws = new WebSocket("wss://f5be-94-255-179-130.ngrok-free.app?ngrok-skip-browser-warning=true")

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({ type: "register-scanner" }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "assign") {
          setAssignedUser(data.user)
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
  }, [])

  return (
    <div>
      <h2>Scanner WebSocket Client</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>

      {assignedUser ? (
        <div>
          <h3>Assigned User:</h3>
          <p>Name: {assignedUser.name}</p>
        </div>
      ) : (
        <div>
          <h3>Messages received:</h3>
          <ul>
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
