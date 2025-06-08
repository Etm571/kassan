"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ScanSuccessClient({
  user,
  assignError,
}: {
  user: any;
  assignError: string | null;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "https://" + process.env.NEXT_PUBLIC_WEBAPP });
    }, 5 * 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">
        Scanning session started
      </h1>
      {assignError ? (
        <p className="text-lg text-red-500">{assignError}</p>
      ) : (
        <p className="text-lg text-gray-600">
          Hello, {user.name}! You are now ready to start scanning!
        </p>
      )}
    </div>
  );
}