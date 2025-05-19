"use client";

import { useEffect, useState } from "react";

export default function ScanSuccessClient({ user }: { user: any }) {
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    const assignUser = async () => {
      try {
        const res = await fetch(
          //8080
          "https://6cc7-94-255-179-130.ngrok-free.app/assign",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ user }),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          setAssignError(error.fel || "Failed to assign scanner.");
        } else {
          const data = await res.json();
          console.log("Assigned to scanner ID:", data.skickadTill);
        }
      } catch (err) {
        console.error("Network error:", err);
        setAssignError("Network error occurred while assigning scanner.");
      }
    };

    assignUser();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">
        Scanning Session Started
      </h1>
      {assignError ? (
        <p className="text-lg text-red-500">{assignError}</p>
      ) : (
        <p className="text-lg text-gray-600">
          Welcome {user.name}! You're now ready to start scanning.
        </p>
      )}
    </div>
  );
}
