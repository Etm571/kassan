import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";
import { useWebSocket } from "../contexts/websocket";

import { EMDK } from "capacitor-emdk";

export default function ScannerClient() {
  const { connected, sendMessage } = useWebSocket();
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const hasSentFree = useRef(false);

  async function unlockCradle() {
    try {
      await EMDK.unlockCradle();
      alert("Cradle unlocked successfully.");
    } catch (error) {
      alert("Failed to unlock cradle: " + error);
    }
  }

  if (connected && !hasSentFree.current) {
    sendMessage({ type: "free" });
    console.log("[ScannerClient] Sent free message (SSR-safe)");
    hasSentFree.current = true;
  }

  const handleScreenTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    const timer = setTimeout(() => {
      if (newCount < 7) {
        setTapCount(0);
      }
    }, 3000);

    if (newCount >= 7) {
      clearTimeout(timer);
      setTapCount(0);

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
      <button onClick={unlockCradle}>Låsupp</button>
    </div>
  );
}
