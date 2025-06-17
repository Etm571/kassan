"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMembers() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUserId("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      const data = await res.json();
      setUserId(data.userId);
      setEmail("");
      setName("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Add User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="First and Last Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add User
          </button>

          <div className="min-h-[48px]">
            {userId && (
              <p className="text-green-700 font-medium bg-green-100 py-2 px-3 rounded-lg">
                User created with ID:{" "}
                <span className="font-mono break-all text-gray-900">{userId}</span>
              </p>
            )}
            {error && (
              <p className="text-red-700 font-medium bg-red-100 py-2 px-3 rounded-lg">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
