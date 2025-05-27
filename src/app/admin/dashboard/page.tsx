"use client";

import { useEffect, useState } from "react";
import { FiWifi, FiWifiOff, FiRefreshCw, FiList, FiRadio } from "react-icons/fi";

export default function HomePage() {
  const [scanners, setScanners] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial list via HTTP on startup
  useEffect(() => {
    const fetchInitialScanners = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:8080/scanners");
        const data = await res.json();
        if (data?.scanners) {
          setScanners(data.scanners);
        }
      } catch (err) {
        console.error("Failed to fetch scanners via HTTP:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialScanners();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/client");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "scanner-list") {
          setScanners(data.scanners);
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.warn("WebSocket closed");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const refreshScanners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8080/scanners");
      const data = await res.json();
      if (data?.scanners) {
        setScanners(data.scanners);
      }
    } catch (err) {
      console.error("Failed to refresh scanners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FiRadio className="text-blue-500 text-3xl" />
            <h1 className="text-2xl font-semibold text-gray-800">Scanners</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? <FiWifi className="mr-2" /> : <FiWifiOff className="mr-2" />}
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <button 
              onClick={refreshScanners}
              className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
              disabled={isLoading}
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4 text-gray-600">
            <FiList className="mr-2" />
            <h2 className="font-medium">Available Scanners</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <FiRefreshCw className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : scanners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No scanners available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {scanners.map((id) => (
                <div 
                  key={id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FiWifi className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{id}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}