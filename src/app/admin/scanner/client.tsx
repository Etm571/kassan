"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/app/providers/websocket";
import { 
  FiWifi, 
  FiWifiOff, 
  FiRefreshCw, 
  FiRadio, 
  FiCheckCircle, 
  FiClock,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUser
} from "react-icons/fi";

interface Scanner {
  id: string;
  status: "free" | "occupied";
  user: { name: string; userId: string } | null;
  startTime: string | null;
}

export default function ScannerClient({ initialScanners }: { initialScanners: Scanner[] }) {
  const [scanners, setScanners] = useState<Scanner[]>(initialScanners);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, addMessageHandler, removeMessageHandler } = useWebSocket();
  const router = useRouter();
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = (data: any) => {
      if (data.type === "scanner-list") {
        setScanners(data.scanners || []);
      }
    };
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [addMessageHandler, removeMessageHandler]);

  const filteredScanners = scanners.filter(scanner => 
    scanner.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (scanner.user?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    scanner.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredScanners.length / itemsPerPage);
  const paginatedScanners = filteredScanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const refreshScanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/scanners");
      const data = await res.json();
      setScanners(data.scanners || []);
    } catch (error) {
      console.error("Failed to refresh scanners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiRadio className="mr-2" /> Scanners
        </h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isConnected ? "text-green-500" : "text-red-500"}`}>
            {isConnected ? <FiWifi className="mr-1" /> : <FiWifiOff className="mr-1" />}
            <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <button
            onClick={refreshScanners}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded transition"
          >
            <FiRefreshCw className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search scanners..."
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

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="min-w-full">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 font-medium text-gray-700 gap-4">
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Scanner ID</div>
            <div className="col-span-3">User</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-1">Actions</div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <FiRefreshCw className="animate-spin inline-block mr-2" />
              Loading scanners...
            </div>
          ) : paginatedScanners.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? "No matching scanners found" : "No scanners available"}
            </div>
          ) : (
            paginatedScanners.map((scanner) => (
              <div 
                key={scanner.id} 
                className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 p-3 items-center gap-4"
              >
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scanner.status === "free" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {scanner.status === "free" ? (
                      <FiCheckCircle className="mr-1" />
                    ) : (
                      <FiClock className="mr-1" />
                    )}
                    {scanner.status.charAt(0).toUpperCase() + scanner.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-3 font-medium"> {/* Increased from col-span-2 to col-span-3 */}
                  <span className="block truncate" title={scanner.id}>
                    {scanner.id}
                  </span>
                </div>
                <div className="col-span-3"> {/* Decreased from col-span-4 to col-span-3 */}
                  {scanner.user ? (
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      <span>{scanner.user.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  {scanner.startTime ? (
                    new Date(scanner.startTime).toLocaleTimeString()
                  ) : (
                    "-"
                  )}
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => router.push(`/admin/scanner/${scanner.id}`)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {paginatedScanners.length} of {filteredScanners.length} scanners
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