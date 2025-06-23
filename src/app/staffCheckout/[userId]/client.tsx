"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

export default function StaffCheckoutClient() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const userId =
    typeof params.userId === "string"
      ? params.userId
      : Array.isArray(params.userId)
      ? params.userId[0]
      : "";

  // Fetch scanned items on mount or when userId changes
  useEffect(() => {
    async function getScannedItems() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/userItems?userId=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch scanned items");
        }
        const data = await res.json();
        setScannedItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      getScannedItems();
    }
  }, [userId]);

  const confirmCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/scanned-items/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to confirm checkout");
      alert("Checkout confirmed successfully!");
      // Optionally refresh the scanned items after confirming checkout
      setScannedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Spot check</h1>
              <p className="text-gray-600">User ID: {userId}</p>
            </div>
            <button
              onClick={confirmCheckout}
              disabled={isLoading || scannedItems.length === 0}
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Confirm Checkout"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          {scannedItems.length === 0 ? (
            <p className="text-gray-500">No items scanned yet</p>
          ) : (
            <div className="space-y-4">
              {scannedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{item.item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Barcode: {item.item.barcode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Total Items: {scannedItems.length}</h3>
              <h3 className="font-medium">
                Total Quantity:{" "}
                {scannedItems.reduce((sum, item) => sum + item.quantity, 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
