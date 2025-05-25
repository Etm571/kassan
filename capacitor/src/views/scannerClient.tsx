import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";

export default function ScannerClient() {
  const [connected, setConnected] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWebsocket = localStorage.getItem("websocketUrl") || import.meta.env.VITE_WEBSOCKET;
    const ws = new WebSocket(`wss://${storedWebsocket}?ngrok-skip-browser-warning=true`);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "register-scanner" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "assign") {
          const user = data.user;
          navigate("/start-scanning", {
            state: { name: user.name, userId: user.userId, token: user.token },
          });
        }
      } catch {
        console.error("Failed: ", event.data);
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, [navigate]);

  const handleScreenTap = async () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    const timer = setTimeout(() => {
      if (newCount < 7) setTapCount(0);
    }, 3000);

    if (newCount >= 7) {
      setTapCount(0);
      clearTimeout(timer);

      const value = window.prompt("Enter PIN:");
      if (value === null) return;

      const correctPin = localStorage.getItem("adminPin") || import.meta.env.VITE_ADMIN_PIN;

      if (value === correctPin) {
        navigate("/settings");
      } else {
        window.alert("Wrong PIN");
      }
    }
  };

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
    </div>
  );
}
