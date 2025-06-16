"use client";

import Link from "next/link";
import { FiUsers, FiPackage, FiRadio, FiHome } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <FiHome className="mr-1" />,
    },
    {
      name: "Add Members",
      href: "/admin/addMembers",
      icon: <FiUsers className="mr-1" />,
    },
    {
      name: "Manage Items",
      href: "/admin/items",
      icon: <FiPackage className="mr-1" />,
    },
    {
      name: "Scanners",
      href: "/admin/scanner",
      icon: <FiRadio className="mr-1" />,
    },
  ];

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Kassan - Admin</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  } transition-colors`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
