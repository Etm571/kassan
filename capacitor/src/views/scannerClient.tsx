import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";

export default function ScannerClient() {
  const [connected, setConnected] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const initWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    return;
  }

    const storedHostname =
      localStorage.getItem("websocketUrl") || import.meta.env.VITE_WEBSOCKET;
    const ws = new WebSocket(`wss://${storedHostname}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
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

    ws.onclose = () => {
      setConnected(false);
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = 2000 * (reconnectAttemptsRef.current + 1);
        setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          initWebSocket();
        }, timeout);
      } else {
        console.error("Maximalt antal återanslutningsförsök uppnått");
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  };

  useEffect(() => {
  initWebSocket();
  return () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
}, []);

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

      const correctPin =
        localStorage.getItem("adminPin") || import.meta.env.VITE_ADMIN_PIN;

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
