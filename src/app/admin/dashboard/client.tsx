"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/app/providers/websocket";
import { useRouter } from "next/navigation";
import {
  FiWifi,
  FiWifiOff,
  FiRadio,
  FiCheckCircle,
  FiClock,
  FiActivity
} from "react-icons/fi";

interface Scanner {
  id: string;
  status: "free" | "occupied";
}

export default function ScannerClient({ initialScanners }: { initialScanners: Scanner[] }) {
  const [scanners, setScanners] = useState<Scanner[]>(initialScanners);
  const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    const handler = (data: any) => {
      if (data.type === "scanner-list") {
        setScanners(data.scanners || []);
      }
    };
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [addMessageHandler, removeMessageHandler]);

  const activeCount = scanners.filter(s => s.status === "occupied").length;
  const totalCount = scanners.length;
  const freeCount = totalCount - activeCount;

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FiRadio className="text-blue-500 text-3xl" />
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isConnected ? "text-green-500" : "text-red-500"}`}>
              {isConnected ? <FiWifi className="mr-2" /> : <FiWifiOff className="mr-2" />}
              <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-800">Total Scanners</h3>
              <FiRadio className="text-blue-500 text-xl" />
            </div>
            <p className="text-3xl font-bold mt-2 text-blue-900">{totalCount}</p>
            <p className="text-sm text-blue-700 mt-1">All connected devices</p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-yellow-800">Active Now</h3>
              <FiActivity className="text-yellow-500 text-xl" />
            </div>
            <p className="text-3xl font-bold mt-2 text-yellow-900">{activeCount}</p>
            <p className="text-sm text-yellow-700 mt-1">Currently in use</p>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-800">Available</h3>
              <FiCheckCircle className="text-green-500 text-xl" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-900">{freeCount}</p>
            <p className="text-sm text-green-700 mt-1">Ready for use</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Real-time Status</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center ml-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {scanners.map(scanner => (
              <div 
                key={scanner.id}
                onClick={() => router.push(`/admin/scanner/${scanner.id}`)} 
                className={`p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
                  scanner.status === "occupied" 
                    ? "bg-yellow-100 border border-yellow-200" 
                    : "bg-green-100 border border-green-200"
                }`}
              >
                <div className={`p-3 rounded-full ${
                  scanner.status === "occupied" ? "bg-yellow-200" : "bg-green-200"
                }`}>
                  {scanner.status === "occupied" 
                    ? <FiClock className="text-yellow-600 text-xl" /> 
                    : <FiCheckCircle className="text-green-600 text-xl" />
                  }
                </div>
                <span className="mt-2 font-medium text-gray-800">{scanner.id.slice(0, 8)}</span>
                <span className={`text-xs mt-1 ${
                  scanner.status === "occupied" ? "text-yellow-700" : "text-green-700"
                }`}>
                  {scanner.status === "occupied" ? "Active" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}