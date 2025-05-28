"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiSave, FiTrash2, FiEdit2, FiDollarSign, FiImage, FiCode, FiPackage } from "react-icons/fi";

type Item = {
  id: number;
  name: string;
  barcode: string;
  price: string;
  imagePath?: string | null;
};

export default function AdminItemForm() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/public/items")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/manageItems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, barcode, imagePath, price }),
    });

    if (res.ok) {
      setMessage("Item added successfully");
      setName("");
      setBarcode("");
      setImagePath("");
      setPrice("");
      const updatedItems = await fetch("/api/public/items").then((res) =>
        res.json()
      );
      setItems(updatedItems);
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to add item"}`);
    }
  };

  const handleUpdate = async (item: Item) => {
    const res = await fetch("/api/admin/manageItems", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (res.ok) {
      setMessage("Item updated successfully");
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to update item"}`);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/manageItems?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Item deleted successfully");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to delete item"}`);
    }
  };

  const handleItemChange = (id: number, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm text-gray-600 placeholder-black">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
      
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FiPlus className="mr-2" /> Add New Item
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border-b border-gray-200 py-2">
            <FiPackage className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 outline-none"
              required
            />
          </div>
          
          <div className="flex items-center border-b border-gray-200 py-2">
            <FiCode className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 outline-none"
              required
            />
          </div>
          
          <div className="flex items-center border-b border-gray-200 py-2">
            <FiDollarSign className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          
          <div className="flex items-center border-b border-gray-200 py-2">
            <FiImage className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
          >
            <FiSave className="mr-2" /> Save Item
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-700 p-4 border-b flex items-center">
          <FiPackage className="mr-2" /> Current Inventory ({items.length})
        </h3>
        
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No items found. Add your first item above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(item.id, "name", e.target.value)
                      }
                      className="w-full border p-2 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Barcode</label>
                    <input
                      type="text"
                      value={item.barcode}
                      onChange={(e) =>
                        handleItemChange(item.id, "barcode", e.target.value)
                      }
                      className="w-full border p-2 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Price</label>
                    <input
                      type="text"
                      value={item.price || ""}
                      onChange={(e) =>
                        handleItemChange(item.id, "price", e.target.value)
                      }
                      className="w-full border p-2 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Image URL</label>
                    <input
                      type="text"
                      value={item.imagePath || ""}
                      onChange={(e) =>
                        handleItemChange(item.id, "imagePath", e.target.value)
                      }
                      className="w-full border p-2 rounded text-sm"
                      placeholder="Image URL"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleUpdate(item)}
                    className="flex items-center bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600 transition"
                  >
                    <FiEdit2 className="mr-1" /> Update
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition"
                  >
                    <FiTrash2 className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}