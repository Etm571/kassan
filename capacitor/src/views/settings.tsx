import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/settings.css"

export default function SettingsScreen() {
  const [backendUrl, setBackendUrl] = useState("")
  const [websocketUrl, setWebsocketUrl] = useState("")
  const [adminPin, setAdminPin] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const savedBackend = localStorage.getItem("backendUrl") || import.meta.env.VITE_WEBAPP|| ""
    const savedWebsocket = localStorage.getItem("websocketUrl") || import.meta.env.VITE_WEBSOCKET || ""
    const savedPin = localStorage.getItem("adminPin") || import.meta.env.VITE_ADMIN_PIN || ""

    setBackendUrl(savedBackend)
    setWebsocketUrl(savedWebsocket)
    setAdminPin(savedPin)
  }, [])

  const handleSave = () => {
    localStorage.setItem("backendUrl", backendUrl)
    localStorage.setItem("websocketUrl", websocketUrl)
    localStorage.setItem("adminPin", adminPin)
    alert("Inställningar sparade!")
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="settings-container">
      <h2>Inställningar</h2>

      <label>
        Backend-adress:
        <input
          type="text"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
        />
      </label>

      <label>
        WebSocket-adress:
        <input
          type="text"
          value={websocketUrl}
          onChange={(e) => setWebsocketUrl(e.target.value)}
        />
      </label>

      <label>
        Admin-PIN:
        <input
          type="password"
          value={adminPin}
          onChange={(e) => setAdminPin(e.target.value)}
        />
      </label>

      <button onClick={handleSave}>Spara</button>
      <button className="back-button" onClick={handleBack}>Tillbaka</button>
    </div>
  )
}
