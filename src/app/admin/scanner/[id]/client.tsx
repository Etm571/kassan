"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/app/providers/websocket";
import { format } from "date-fns-tz";

interface Scanner {
  id: string;
  status: "free" | "occupied";
  user: { name: string; userId: string } | null;
  startTime: string | null;
}

export default function ScannerDetailClient({
  scanner: initialScanner,
  id,
}: {
  scanner: Scanner | null;
  id: string;
}) {
  const [scanner, setScanner] = useState<Scanner | null>(initialScanner);
  const { addMessageHandler, removeMessageHandler, send } = useWebSocket();

  const handleTerminate = () => {
    if (!scanner) {
      console.warn("No scanner to terminate");
      return;
    };
    send({ type: "free", id: scanner.id });
  };

  useEffect(() => {
    const handler = (data: any) => {
      if (data.type === "scanner-list") {
        const updatedScanner = data.scanners?.find((s: Scanner) => s.id === id);
        if (updatedScanner) {
          setScanner(updatedScanner);
        }
      }
    };
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [addMessageHandler, removeMessageHandler, id]);

  if (!scanner) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Scanner Not Found
          </h1>
          <p className="text-gray-600">
            The scanner with ID{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {id}
            </span>{" "}
            could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scanner Details</h1>
          <div className="mt-2 flex items-center">
            <span className="text-gray-600">ID:</span>
            <span className="ml-2 font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-800">
              {scanner.id}
            </span>
            {scanner.status === "occupied" && (
              <button
                onClick={handleTerminate}
                className="ml-6 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                Terminate
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Status</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  scanner.status === "free"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {scanner.status.charAt(0).toUpperCase() +
                  scanner.status.slice(1)}
              </span>
            </div>
          </div>

          {scanner.user ? (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Current User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-black">{scanner.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono font-medium text-gray-800">
                    {scanner.user.userId}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Session Started</p>
                  <p className="font-medium text-black">
                    {scanner.startTime && !isNaN(new Date(scanner.startTime).getTime())
                      ? format(new Date(scanner.startTime), "yyyy-MM-dd HH:mm", {
                          timeZone: "Europe/Stockholm",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-2">No active user session</div>
              <div className="text-sm text-gray-400">
                This scanner is currently available, last started session:{" "}
                <p className="font-medium text-black">
                  {scanner.startTime
                    ? format(new Date(scanner.startTime), "yyyy-MM-dd HH:mm", {
                        timeZone: "Europe/Stockholm",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
