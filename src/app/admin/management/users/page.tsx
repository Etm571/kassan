"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FiPlus, FiSave, FiTrash2, FiEdit2, FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiMoreVertical } from "react-icons/fi";
import DropdownPortal from "@/app/components/dropdownportal";


type User = {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  suspended?: boolean;
  active?: boolean;
};

export default function UserManagement() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const usersPerPage = 20;
  const dropdownButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    console.log(data)
    setUsers(Array.isArray(data) ? data : []);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      setMessage("User added successfully");
      setEmail("");
      setName("");
      fetchUsers();
      setCurrentPage(1);
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to add user"}`);
    }
  };

  const handleUpdate = async (user: User) => {
    const res = await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      setMessage("User updated successfully");
      fetchUsers();
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to update user"}`);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    const res = await fetch(`/api/admin/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    if (res.ok) {
      setMessage("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      const error = await res.json();
      setMessage(`Error: ${error.error || "Failed to delete user"}`);
    }
  };

  const handleSuspend = async (user: User) => {
    const confirmed = confirm(
      user.suspended
        ? "Unsuspend this user?"
        : "Suspend this user? Suspended users cannot log in."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          suspended: !user.suspended
        }),
      });

      if (res.ok) {
        setMessage(
          user.suspended
            ? "User unsuspended successfully"
            : "User suspended successfully"
        );
        fetchUsers();
        setOpenDropdown(null);
      } else {
        const error = await res.json();
        setMessage(`Error: ${error.error || "Failed to update suspension"}`);
      }
    } catch (error) {
      setMessage("Network error occurred while updating suspension status");
    }
  };

  const handleActiveStatus = async (user: User) => {
    const confirmed = confirm(
      user.active
        ? "Deactivate this user?"
        : "Activate this user?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          active: !user.active
        }),
      });

      if (res.ok) {
        setMessage(
          user.active
            ? "User deactivated successfully"
            : "User activated successfully"
        );
        fetchUsers();
        setOpenDropdown(null);
      } else {
        const error = await res.json();
        setMessage(`Error: ${error.error || "Failed to update active status"}`);
      }
    } catch (error) {
      setMessage("Network error occurred while updating active status");
    }
  };

  const handleUserChange = (id: string, field: keyof User, value: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: value } : user))
    );
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  return (
    <div className="max-w-full mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUser className="mr-2" /> Users
        </h1>
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6 items-end">
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="col-span-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FiPlus className="mr-2" /> Add User
          </button>
        </div>
      </div>

      <div style={{ minHeight: "2.8rem", marginBottom: "1rem" }}>
        {message && (
          <div className={`p-3 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="min-w-full overflow-x-auto">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 font-medium text-gray-700 gap-4">
            <div className="col-span-2">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Created</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {paginatedUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? "No matching users found" : "No users found. Add your first user above."}
            </div>
          ) : (
            <div>
              {paginatedUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 p-3 items-center gap-4 relative">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={user.userId}
                      readOnly
                      className="w-full p-2 border rounded text-sm bg-gray-100 cursor-not-allowed text-gray-500 truncate"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => handleUserChange(user.id, "name", e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => handleUserChange(user.id, "email", e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserChange(user.id, "role", e.target.value)}
                      className="w-full p-2 border rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="col-span-1 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.suspended
                      ? "bg-yellow-100 text-yellow-800"
                      : user.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {user.suspended ? "Suspended" : user.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="col-span-1 flex space-x-2">
                    <button
                      onClick={() => handleUpdate(user)}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                      title="Update"
                    >
                      <FiSave size={16} />
                    </button>
                    <div className="relative">
                      <button
                        ref={el => { dropdownButtonRefs.current[user.id] = el; }}
                        onClick={() => toggleDropdown(user.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100"
                        title="More options"
                      >
                        <FiMoreVertical size={16} />
                      </button>
                      {openDropdown === user.id && dropdownButtonRefs.current[user.id] !== null && (
                        <DropdownPortal
                          triggerRef={{ current: dropdownButtonRefs.current[user.id] as HTMLElement }}
                          onClose={() => setOpenDropdown(null)}
                        >
                          <div className="w-48 bg-white rounded-md shadow-lg border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleSuspend(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {user.suspended ? "Unsuspend User" : "Suspend User"}
                              </button>
                              <button
                                onClick={() => handleActiveStatus(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {user.active ? "Deactivate User" : "Activate User"}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete User
                              </button>
                            </div>
                          </div>
                        </DropdownPortal>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
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