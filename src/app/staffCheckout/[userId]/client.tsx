"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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

interface StaffCheckoutClientProps {
  staffUserId: string;
}

export default function StaffCheckoutClient({ staffUserId }: StaffCheckoutClientProps) {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const userId =
    typeof params.userId === "string"
      ? params.userId
      : Array.isArray(params.userId)
      ? params.userId[0]
      : "";

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
      const response = await fetch(`/api/userItems`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, passed: true, staffUserId }),
      });
      if (!response.ok) throw new Error("Failed to confirm checkout");
      setScannedItems([]);
      router.push("/stopScan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const denyCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/userItems`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, passed: false, staffUserId }),
      });
      if (!response.ok) throw new Error("Failed to deny checkout");
      setScannedItems([]);
      router.push("/stopScan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Spot Check</h1>
            <p className="text-gray-600 mt-2">
              Please verify the customer's items against what they're checking out.
              Ensure all items match what they've scanned.
            </p>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scannedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.item.barcode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        <div className="w-64 flex flex-col gap-4">
  <div className="bg-white rounded-lg shadow p-6 sticky top-4">
    <h2 className="text-lg font-semibold mb-4">Checkout Verification</h2>
    <p className="text-sm text-gray-600 mb-4">
      After verifying the items, select one of the options below:
    </p>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={confirmCheckout}
        disabled={isLoading || scannedItems.length === 0}
        className="aspect-square flex flex-col items-center justify-center p-4 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Correct</span>
      </button>
      <button
        onClick={denyCheckout}
        disabled={isLoading || scannedItems.length === 0}
        className="aspect-square flex flex-col items-center justify-center p-4 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Incorrect</span>
      </button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}