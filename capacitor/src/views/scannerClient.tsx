import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";
import { useWebSocket } from "../contexts/websocket";
import { registerPlugin } from '@capacitor/core';


export default function ScannerClient() {
  const { connected, sendMessage } = useWebSocket();
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const hasSentFree = useRef(false);
  interface ZebraCradleUnlockPlugin {
    unlock: () => Promise<void>;
  }
  const ZebraCradleUnlock = registerPlugin<ZebraCradleUnlockPlugin>('ZebraCradleUnlock');


  if (connected && !hasSentFree.current) {
    sendMessage({ type: "free" });
    console.log("[ScannerClient] Sent free message (SSR-safe)");
    hasSentFree.current = true;
  }

  const unlockScanner = async () => {
  try {
    await ZebraCradleUnlock.unlock();
    alert('Scanner unlocked!');
  } catch (err) {
    if (err instanceof Error) {
      alert('Unlock failed: ' + err.message);
    } else {
      alert('Unlock failed: ' + String(err));
    }
  }
};

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
          <button onClick={unlockScanner}>Unlock Scanner</button>
          <div className="footer-text">Kassan</div>
        </>
      )}
    </div>
  );
}
