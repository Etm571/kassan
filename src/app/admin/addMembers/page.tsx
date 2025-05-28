'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddMembers() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setUserId('')

  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })

  if (res.ok) {
    const data = await res.json()
    setUserId(data.userId)
    setEmail('')
    setName('')
    router.refresh()
  } else {
    const data = await res.json()
    setError(data.error || 'Något gick fel')
  }
}


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="Namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Lägg till användare
      </button>
      {userId && <p className="text-green-600">Användare skapad med ID: {userId}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
