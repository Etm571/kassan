"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

interface SpotCheckItem {
  id: string;
  item: Item;
  quantity: number;
}

export default function StaffCheckoutPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [spotCheckItems, setSpotCheckItems] = useState<SpotCheckItem[]>([]);
  const [hasSpotCheck, setHasSpotCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchScannedItems();
    }
  }, [userId]);

  const fetchScannedItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/userItems?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch scanned items');
      const data = await response.json();
      
      setScannedItems(data.items || []);
      setHasSpotCheck(data.spotCheck || false);
      setSpotCheckItems(data.spotCheckItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScannedItem = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scanned-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to delete item');
      fetchScannedItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const completeCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scanned-items/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to complete checkout');
      fetchScannedItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySpotCheck = async (passed: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scanned-items/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, passed }),
      });
      if (!response.ok) throw new Error('Failed to verify spot check');
      fetchScannedItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = scannedItems.filter(item =>
    item.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item.barcode.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Staff Checkout</h1>
              <p className="text-gray-600">User ID: {userId}</p>
            </div>
            <button
              onClick={completeCheckout}
              disabled={isLoading || hasSpotCheck}
              className={`px-4 py-2 rounded text-white ${hasSpotCheck ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
            >
              Complete Checkout
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">
                ×
              </button>
            </div>
          )}

          {hasSpotCheck && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-yellow-800">Spot Check Required</h2>
                  <p className="text-yellow-700">Please verify these randomly selected items:</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => verifySpotCheck(true)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => verifySpotCheck(false)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {spotCheckItems.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded border border-yellow-200">
                    <p className="font-medium">{item.item.name}</p>
                    <p className="text-sm text-gray-600">Barcode: {item.item.barcode}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Scanned Items</h2>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-500">No items found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.item.barcode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.item.stock || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteScannedItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Checkout Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800">Total Items</h3>
                <p className="text-2xl font-bold">{scannedItems.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">Total Quantity</h3>
                <p className="text-2xl font-bold">
                  {scannedItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800">Unique Items</h3>
                <p className="text-2xl font-bold">
                  {new Set(scannedItems.map(item => item.item.barcode)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}