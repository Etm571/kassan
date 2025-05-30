import { Routes, Route } from "react-router-dom";
import ScannerClient from "./views/scannerClient";
import StartScanning from "./views/startScanning";
import ScannerView from "./views/scannerView";
import Settings from "./views/settings";
import { WebSocketProvider } from "./contexts/websocket";

export default function App() {
  return (
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<ScannerClient />} />
          <Route path="/start-scanning" element={<StartScanning />} />
          <Route path="/scanning" element={<ScannerView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </WebSocketProvider>
  );
}