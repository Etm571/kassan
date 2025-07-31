import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { EMDK } from "capacitor-emdk";
import { Device } from '@capacitor/device';
import type { DeviceInfo, BatteryInfo } from '../types/types';


interface WebSocketContextValue {
  connected: boolean;
  sendMessage: (msg: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocket = (): WebSocketContextValue => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return ctx;
};

export const WebSocketProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [connected, setConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

  const initWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const storedHostname =
      localStorage.getItem("websocketUrl") || import.meta.env.VITE_WEBSOCKET;

    const secret =
      localStorage.getItem("websocketSecret") ||
      import.meta.env.VITE_WEBSOCKET_SECRET ||
      "not-set";

    const encodedSecret = encodeURIComponent(secret);
    const url = `wss://${storedHostname}?token=${encodedSecret}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setConnected(true);

      ws.send(JSON.stringify({
        type: "register-scanner",
        deviceInfo: deviceInfo,
        batteryInfo: batteryInfo
      }));
      console.log({
        type: "register-scanner",
        deviceInfo: deviceInfo,
        batteryInfo: batteryInfo
      })
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "assign":
            const { user } = data;
            navigate("/start-scanning", {
              state: {
                name: user.name,
                userId: user.userId,
                token: user.token,
              },
            });
            EMDK.unlockCradle();

            break;
          case "freed":
            navigate("/");
            break;
          default:
            console.warn("[WebSocket] Unhandled message type:", data.type);
        }
      } catch (e) {
        console.error("[WebSocket] Invalid JSON received:", event.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.warn("[WebSocket] Connection closed");

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = 2000 * (reconnectAttemptsRef.current + 1);
        setTimeout(() => {
          reconnectAttemptsRef.current += 1;

          initWebSocket();
        }, timeout);
      } else {
        const intervalId = setInterval(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            initWebSocket();
          } else {
            clearInterval(intervalId);
          }
        }, 60000);
      }
    };

    ws.onerror = (err) => {
      console.error("[WebSocket] Error:", err);
    };
  };

  useEffect(() => {
    const fetchDeviceAndBatteryInfo = async () => {
      const [device, battery] = await Promise.all([
        Device.getInfo(),
        Device.getBatteryInfo(),
      ]);

      setDeviceInfo({
        model: device.model,
        operatingSystem: device.operatingSystem,
        osVersion: device.osVersion,
        androidSDKVersion: device.androidSDKVersion,
        manufacturer: device.manufacturer,
        webViewVersion: device.webViewVersion,
      });

      setBatteryInfo({
        batteryLevel: battery.batteryLevel,
        isCharging: battery.isCharging,
      });
    };

    fetchDeviceAndBatteryInfo();
  }, []);

  useEffect(() => {
    if (deviceInfo && batteryInfo) {
      initWebSocket();
    }
  }, [deviceInfo, batteryInfo]);



  const sendMessage = (msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("[WebSocket] Tried to send while not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
