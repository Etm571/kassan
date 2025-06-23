"use client";

import { Suspense, useState } from "react";
import StaffCheckoutClient from "./client";

interface Item {
  id: string;
  barcode: string;
  name: string;
  stock?: number;
}

interface ScannedItem {
  id: string;
  item: Item;
  quantity: number;
  createdAt: string;
}

async function getScannedItems(userId: string): Promise<ScannedItem[]> {
  const res = await fetch(`/api/userItems?userId=${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch scanned items");
  }

  const data = await res.json();
  return data.items || [];
}

export default function StaffCheckoutPage() {
  const [userId, setUserId] = useState("");
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: input }),
      });
      if (!res.ok) throw new Error("Auth failed");
      setUserId(input);
      const items = await getScannedItems(input);
      setScannedItems(items);
    } catch {
      setAuthError("Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <form onSubmit={handleAuth} className="p-6 rounded-lg shadow-md bg-white w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign in</h1>
          <div className="mb-4">
            <label htmlFor="userid" className="block font-medium mb-2">
              Enter User ID:
            </label>
            <input
              id="userid"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Enter your staff ID"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Authenticate"
            )}
          </button>
          {authError && (
            <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {authError}
            </div>
          )}
        </form>
      </div>
    );
  }

  if (!scannedItems) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-blue-800">Loading items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center text-blue-800">
            <svg className="animate-spin h-8 w-8 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading checkout...
          </div>
        </div>
      }>
        <StaffCheckoutClient/>
      </Suspense>
    </div>
  );
}