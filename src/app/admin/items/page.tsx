"use client";

import { useState, useEffect, useMemo } from "react";
import { FiPlus, FiSave, FiTrash2, FiEdit2, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch("/api/public/items")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

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
      setCurrentPage(1);
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
    <div className="max-w-full mx-auto p-4 bg-white text-gray-600 placeholder-gray-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-4 items-end">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input
            type="text"
            placeholder="Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FiPlus className="mr-2" /> Add Item
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="min-w-full">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 font-medium text-gray-700">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Barcode</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-3">Image URL</div>
            <div className="col-span-1">Actions</div>
          </div>

          {paginatedItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? "No matching items found" : "No items found. Add your first item above."}
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 p-3 items-center">
                <div className="col-span-4 mr-5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    className="w-full p-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 mr-5">
                  <input
                    type="text"
                    value={item.barcode}
                    onChange={(e) => handleItemChange(item.id, "barcode", e.target.value)}
                    className="w-full p-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2 mr-5">
                  <input
                    type="text"
                    value={item.price || ""}
                    onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                    className="w-full p-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-3 mr-5">
                  <input
                    type="text"
                    value={item.imagePath || ""}
                    onChange={(e) => handleItemChange(item.id, "imagePath", e.target.value)}
                    className="w-full p-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                    placeholder="No image"
                  />
                </div>
                <div className="col-span-1 flex space-x-1">
                  <button
                    onClick={() => handleUpdate(item)}
                    className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                    title="Update"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {paginatedItems.length} of {filteredItems.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FiChevronLeft />
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}