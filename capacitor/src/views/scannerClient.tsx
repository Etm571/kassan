import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/scannerClient.css";
import { useWebSocket } from "../contexts/websocket";
import { Device } from '@capacitor/device';
import type { DeviceInfo, BatteryInfo } from '../types/types';

export default function ScannerClient() {
  const { connected, sendMessage } = useWebSocket();
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const hasSentFree = useRef(false);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

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

  const logDeviceInfo = async () => {
    const info = await Device.getInfo();
    setDeviceInfo({
      model: info.model,
      operatingSystem: info.operatingSystem,
      androidSDKVersion: info.androidSDKVersion,
      manufacturer: info.manufacturer,
      webViewVersion: info.webViewVersion,
      osVersion: info.osVersion,
    });
  };

  const logBatteryInfo = async () => {
    const info = await Device.getBatteryInfo();
    setBatteryInfo({
      batteryLevel: info.batteryLevel,
      isCharging: info.isCharging,
    });
  };

  useEffect(() => {
    logDeviceInfo();
    logBatteryInfo();
  }, []);

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
          {deviceInfo && (
            <div className="device-info">
              <h4>Device Info</h4>
              <pre>{JSON.stringify(deviceInfo, null, 2)}</pre>
            </div>
          )}
          {batteryInfo && (
            <div className="battery-info">
              <h4>Battery Info</h4>
              <pre>{JSON.stringify(batteryInfo, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
