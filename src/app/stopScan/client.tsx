"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import CustomConfirmModal from "@/app/components/popup";

export default function StopScan({ user }: { user: any }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmedScan, setConfirmedScan] = useState<boolean | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/userItems?userId=${user.userId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Ett fel inträffade");
        } else {
          setItems(data.items);
          if (confirmedScan) {
            if (data.spotCheck) {
              router.push(`/staffCheckout/${user.userId}`);
            }
          }
        }
      } catch {
        setError("Kunde inte hämta data");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user.userId, user.token, router]);

  useEffect(() => {
    if (!loading && !error && items.length > 0 && confirmedScan === null) {
      setShowConfirmModal(true);
    }
  }, [loading, error, items, confirmedScan]);

  const handleConfirm = (confirmed: any) => {
    setShowConfirmModal(false);
    if (confirmed) {
      setConfirmedScan(true);
    } else {
      alert("Please scan the remaining items and try again.");
      setConfirmedScan(false);
    }
  };

  useEffect(() => {
    if (!loading && !error && items.length === 0 && !confirmedScan) {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "https://" + process.env.NEXT_PUBLIC_WEBAPP });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [items.length, loading, error, confirmedScan]);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );

  const handleConfirmAndPay = async () => {
    try {
      const res = await fetch(
        `/api/userItems?userId=${user.userId}&token=${user.token}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Något gick fel vid betalning.");
        signOut({ callbackUrl: "/" });
      } else {
        alert("Payment completed!");
        setItems([]);
        signOut({ callbackUrl: "https://" + process.env.NEXT_PUBLIC_WEBAPP });
      }
    } catch (err) {
      alert("Could not confirm payment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Fetching your scanned items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-medium text-red-600 mt-4">
            An error occurred.
          </h2>
          <p className="text-red-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Your scanned items
          </h1>
        </header>

        <main className="max-w-3xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-medium text-gray-600 mt-4">
                No items found
              </h2>
              <p className="text-gray-500 mt-2">
                You haven't scanned any items.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Antal varor</p>
                  <p className="font-bold text-lg text-blue-500">
                    {items.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Totalt antal</p>
                  <p className="font-bold text-lg text-blue-500">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} st
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total summa</p>
                  <p className="font-bold text-lg text-blue-500">
                    {totalPrice.toFixed(2)} kr
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {items.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 text-lg">
                          {entry.item.name}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-gray-600">
                        {entry.quantity} x {entry.item.price} kr
                      </p>
                      <p className="text-gray-800 font-bold">
                        {(entry.item.price * entry.quantity).toFixed(2)} kr
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-8">
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 font-medium">Att betala:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPrice.toFixed(2)} kr
                  </p>
                </div>
              </div>
            </>
          )}
        </main>

        {items.length > 0 && (
          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Alert staff
              </button>
              <button
                onClick={handleConfirmAndPay}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm and pay
              </button>
            </div>
          </footer>
        )}
      </div>

      <CustomConfirmModal
        isOpen={showConfirmModal}
        onClose={() => handleConfirm(false)}
        onConfirm={() => handleConfirm(true)}
        title="Scan Confirmation"
        message="Did everything scan correctly?"
      />
    </div>
  );
}
