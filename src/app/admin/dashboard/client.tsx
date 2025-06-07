"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiList,
  FiRadio,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

interface Scanner {
  id: string;
  status: "free" | "occupied";
  user: { name: string; userId: string } | null;
  startTime: string | null;
}

export default function ScannerClient({ initialScanners }: { initialScanners: Scanner[] }) {
  const [scanners, setScanners] = useState<Scanner[]>(initialScanners);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 

  useEffect(() => {
    const ws = new WebSocket("wss://" + process.env.NEXT_PUBLIC_WEBSOCKET + "/client");

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "scanner-list") {
          setScanners(data.scanners || []);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FiRadio className="text-blue-500 text-3xl" />
            <h1 className="text-2xl font-semibold text-gray-800">Scanners</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isConnected ? "text-green-500" : "text-red-500"}`}>
              {isConnected ? <FiWifi className="mr-2" /> : <FiWifiOff className="mr-2" />}
              <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

 
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scanners.map((scanner) => (
            <div
              key={scanner.id}
              onClick={() => router.push(`/admin/scanner/${scanner.id}`)}
              className={`cursor-pointer flex items-center p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                scanner.status === "free"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  scanner.status === "free" ? "bg-green-100" : "bg-yellow-100"
                } mr-3`}
              >
                {scanner.status === "free" ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiClock className="text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{scanner.id}</p>
                <p className="text-xs text-gray-500">
                  {scanner.status === "free" ? "Free" : "Occupied"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
