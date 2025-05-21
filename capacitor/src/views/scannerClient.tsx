import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/scannerClient.css"

export default function ScannerClient() {
  const [connected, setConnected] = useState(false)
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
        }
      } catch {
        console.error("Failed: ", event.data)
      }
    }

    ws.onclose = () => setConnected(false)
    ws.onerror = (err) => console.error("WebSocket error:", err)

    return () => ws.close()
  }, [navigate])

return (
  <div className="scanner-client-container">
    {!connected ? (
      <i className="fas fa-cogs loading-icon" />
    ) : (
      <>
        <div className="connected-wrapper">
          <i className="fas fa-circle-check connected-icon" />
        </div>
        <div className="footer-text">Kassan</div>
      </>
    )}
  </div>
)

}
