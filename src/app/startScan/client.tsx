"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function ScanSuccessClient({ user }: { user: any }) {
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    const assignUser = async () => {
      try {
        const res = await fetch(
          `https://${process.env.NEXT_PUBLIC_WEBSOCKET}/assign`,
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
          setAssignError(error.fel || "Misslyckades med att tilldela skanner.");
        } else {
          const data = await res.json();
          console.log("Tilldelad till skanner-ID:", data.skickadTill);
        }
      } catch (err) {
        console.error("Nätverksfel:", err);
        setAssignError("Nätverksfel vid tilldelning av skanner.");
      }
    };

    assignUser();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 5 * 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">
        Skanningssession Startad
      </h1>
      {assignError ? (
        <p className="text-lg text-red-500">{assignError}</p>
      ) : (
        <p className="text-lg text-gray-600">
          Välkommen {user.name}! Du är nu redo att börja skanna.
        </p>
      )}
    </div>
  );
}
