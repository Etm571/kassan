"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiPlus,
  FiMinus,
  FiSave,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
} from "react-icons/fi";

type Item = {
  id: number;
  name: string;
  barcode: string;
  price: string;
  stock: number;
  imagePath?: string | null;
};

export default function StockManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/public/items");
      const data = await res.json();
      const itemsWithStock = data.map((item: any) => ({
        ...item,
        stock: item.stock ?? 0,
      }));
      setItems(itemsWithStock);
    } catch (error) {
      setMessage("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);
  const handleStockChange = async (itemId: number, delta: number) => {
    try {
      const res = await fetch(`/api/admin/manageItems/${itemId}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === updatedItem.id
              ? { ...item, stock: updatedItem.stock }
              : item
          )
        );
        setMessage(`Stock updated for ${updatedItem.name}`);
      } else {
        const error = await res.json();
        setMessage(`Error: ${error.error || "Failed to update stock"}`);
      }
    } catch (error) {
      setMessage("Network error while updating stock");
    }
  };

  const handleManualStockUpdate = async (
    itemId: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    try {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) {
        const currentItem = items.find((item) => item.id === itemId);
        if (!currentItem) return;

        const delta = value - currentItem.stock;
        await handleStockChange(itemId, delta);
      }
    } catch (error) {
      setMessage("Failed to update stock");
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-2" /> Stock Management
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchItems}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded transition"
          >
            <FiRefreshCw
              className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
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
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="min-w-full">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 font-medium text-gray-700 gap-4">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Barcode</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-3">Stock</div>
            <div className="col-span-1">Actions</div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading items...
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? "No matching items found" : "No items found."}
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 p-3 items-center gap-4"
              >
                <div className="col-span-4 font-medium">{item.name}</div>
                <div className="col-span-2 text-sm text-gray-500">
                  {item.barcode}
                </div>
                <div className="col-span-2 text-sm">${item.price}</div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStockChange(item.id, -1)}
                      className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                      disabled={item.stock <= 0}
                    >
                      <FiMinus size={14} />
                    </button>
                    <input
                      type="number"
                      value={item.stock}
                      onBlur={(e) => handleManualStockUpdate(item.id, e)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, stock: value } : i
                            )
                          );
                        }
                      }}
                      className="w-16 p-1 border rounded text-center"
                      min="0"
                    />
                    <button
                      onClick={() => handleStockChange(item.id, 1)}
                      className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
                <div className="col-span-1 flex space-x-2">
                  <button
                    onClick={() => handleStockChange(item.id, 10)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded"
                  >
                    +10
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FiChevronLeft />
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
