import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/scannerClient.css"

export default function ScannerClient() {
  const [connected, setConnected] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [error, setError] = useState("")
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
          navigate("/start-scanning", { state: { name: user.name, userId: user.userId, token: user.token } })
        }
      } catch {
        console.error("Failed: ", event.data)
      }
    }

    ws.onclose = () => setConnected(false)
    ws.onerror = (err) => console.error("WebSocket error:", err)

    return () => ws.close()
  }, [navigate])

  const handleScreenTap = () => {
    const newCount = tapCount + 1
    setTapCount(newCount)

    const timer = setTimeout(() => {
      if (newCount < 7) {
        setTapCount(0)
      }
    }, 2000)

    if (newCount >= 7) {
      setTapCount(0)
      setShowPinDialog(true)
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }

  const handlePinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (pinInput === import.meta.env.VITE_ADMIN_PIN) {
      navigate("/settingsScreen")
    } else {
      setError("Invalid PIN")
      setPinInput("")
    }
  }

  return (
    <div className="scanner-client-container" onClick={handleScreenTap}>
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

      {showPinDialog && (
        <div className="pin-dialog-overlay">
          <div className="pin-dialog">
            <h3>Enter PIN</h3>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value)
                  setError("")
                }}
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
              <div className="pin-dialog-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowPinDialog(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}