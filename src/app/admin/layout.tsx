"use client";

import Link from "next/link";
import { FiUsers, FiPackage, FiRadio, FiHome, FiChevronDown } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <FiHome className="mr-1" />,
    },
    {
      name: "Stock",
      href: "/admin/stock",
      icon: <FiPackage className="mr-1" />,
    },
    {
      name: "Scanners",
      href: "/admin/scanner",
      icon: <FiRadio className="mr-1" />,
    },

     {
      name: "Management",
      icon: <FiUsers className="mr-1" />,
      subLinks: [
        {
          name: "Manage Members",
          href: "/admin/management/users",
          icon: <FiUsers className="mr-1" />,
        },
        {
          name: "Manage Items",
          href: "/admin/management/items",
          icon: <FiPackage className="mr-1" />,
        },
      ],
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsManagementOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-800">
                Kassan - Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {navLinks.map((link) => {
                if (link.subLinks) {
                  return (
                    <div key={link.name} className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsManagementOpen(!isManagementOpen)}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          link.subLinks.some(subLink => isActive(subLink.href))
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        } transition-colors`}
                      >
                        {link.icon}
                        {link.name}
                        <FiChevronDown className="ml-1" />
                      </button>
                      {isManagementOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                          {link.subLinks.map((subLink) => (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className={`block px-4 py-2 text-sm ${
                                isActive(subLink.href)
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                              onClick={() => setIsManagementOpen(false)}
                            >
                              <div className="flex items-center">
                                {subLink.icon}
                                {subLink.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(link.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } transition-colors`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/admin" })}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}