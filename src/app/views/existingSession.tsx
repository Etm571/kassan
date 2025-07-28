"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { signOut } from "next-auth/react";


export default function ActiveScanningSession() {
  const router = useRouter();

 useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 5 * 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <ClockIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Active Scanning Session
        </h2>
        <p className="mt-2 text-center text-sm text-gray-700">
          You already have an active scanning session running.
        </p>

      </div>
    </div>
  );
}