"use client"

import { useEffect, useState } from "react"

export default function StopScan({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/items/userItems?userId=${user.userId}&token=${user.token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Ett fel inträffade")
        } else {
          setItems(data.items)
        }
      } catch (err) {
        setError("Kunde inte hämta data")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [user.userId, user.token])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your scanned items</h1>
      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <ul className="space-y-2">
          {items.map((entry) => (
            <li key={entry.id} className="border p-3 rounded-xl shadow">
              <p><strong>Item:</strong> {entry.item.name}</p>
              <p><strong>Barcode:</strong> {entry.item.barcode}</p>
              <p><strong>Quantity:</strong> {entry.quantity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
