'use client'

import { useState } from 'react'

export default function AdminItemForm() {
  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, barcode, imagePath })
    })

    if (res.ok) {
      setMessage('Artikel tillagd')
      setName('')
      setBarcode('')
      setImagePath('')
    } else {
      const error = await res.json()
      setMessage(`Fel: ${error.error || 'Misslyckades'}`)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-2xl shadow">
      <h2 className="text-xl text-black font-semibold mb-4">Lägg till artikel</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded placeholder-gray-500"
          required
        />
        <input
          type="text"
          placeholder="Streckkod"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full border p-2 rounded placeholder-gray-500"
          required
        />
        <input
          type="text"
          placeholder="Bildsökväg (valfri)"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          className="w-full border p-2 rounded placeholder-gray-500"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Spara
        </button>
      </form>
      {message && <p className="mt-4 text-center text-black">{message}</p>}
    </div>
  )
}
