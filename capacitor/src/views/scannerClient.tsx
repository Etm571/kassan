import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";
import { Dialog } from "@capacitor/dialog";


export default function ScannerClient() {
  const [connected, setConnected] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket(
      `wss://${import.meta.env.VITE_WEBSOCKET}?ngrok-skip-browser-warning=true`
    );

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
      const { value, cancelled } = await Dialog.prompt({
        title: "Admin PIN Required",
        message: "Enter PIN",
      });

      if (cancelled) return;
      if (value === import.meta.env.VITE_ADMIN_PIN) {
        navigate("/settingsScreen");
      } else if (value !== null) {
        await Dialog.alert({ title: "Error", message: "Invalid PIN" });
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
