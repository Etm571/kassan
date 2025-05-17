"use client";

import { useEffect } from "react";

export default function ScanSuccessClient({ user }: { user: any }) {
  useEffect(() => {
    const ws = new WebSocket("ws://192.168.50.169:8080");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "start-scan", username: user.name }));
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Scanning Session Started</h1>
      <p className="text-lg text-gray-600">
        Welcome {user.name}! You're now ready to start scanning.
      </p>
    </div>
  );
}
