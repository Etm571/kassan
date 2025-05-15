'use client'

import { useState, useEffect } from 'react'

type Item = {
  id: number
  name: string
  barcode: string
  price: string
  imagePath?: string | null
}

export default function AdminItemForm() {
  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetch('/api/items/manage')
      .then(res => res.json())
      .then(setItems)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, barcode, imagePath, price })
    })

    if (res.ok) {
      setMessage('Artikel tillagd')
      setName('')
      setBarcode('')
      setImagePath('')
      setPrice('')
      const updatedItems = await fetch('/api/items/manage').then(res => res.json())
      setItems(updatedItems)
    } else {
      const error = await res.json()
      setMessage(`Fel: ${error.error || 'Misslyckades'}`)
    }
  }

  const handleUpdate = async (item: Item) => {
    const res = await fetch('/api/items/manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })

    if (res.ok) {
      setMessage('Artikel uppdaterad')
    } else {
      const error = await res.json()
      setMessage(`Fel vid uppdatering: ${error.error || 'Misslyckades'}`)
    }
  }

  const handleItemChange = (id: number, field: keyof Item, value: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded-2xl shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Lägg till artikel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Streckkod"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Pris"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Bildsökväg (valfri)"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Spara
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}

      <h3 className="text-lg font-semibold mt-10 mb-2">Registrerade artiklar</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded bg-gray-50 space-y-2">
            <input
              type="text"
              value={item.name}
              onChange={e => handleItemChange(item.id, 'name', e.target.value)}
              className="w-full border p-1 rounded"
            />
            <input
              type="text"
              value={item.barcode}
              onChange={e => handleItemChange(item.id, 'barcode', e.target.value)}
              className="w-full border p-1 rounded"
            />
            <input
              type="text"
              value={item.price || ''}
              onChange={e => handleItemChange(item.id, 'price', e.target.value)}
              className="w-full border p-1 rounded"
            />
            <input
              type="text"
              value={item.imagePath || ''}
              onChange={e => handleItemChange(item.id, 'imagePath', e.target.value)}
              className="w-full border p-1 rounded"
              placeholder='Bildsökväg'
            />
            <button
              onClick={() => handleUpdate(item)}
              className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700"
            >
              Uppdatera
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
