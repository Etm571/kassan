"use client";

import Link from "next/link";
import { FiUsers, FiPackage, FiRadio, FiHome } from "react-icons/fi";

export default function AdminHome() {
  const features = [
    {
      name: "Dashboard",
      description: "Monitor scanners and system status",
      href: "/admin/dashboard",
      icon: <FiHome className="text-2xl text-blue-600" />,
    },
    {
      name: "Add Members",
      description: "Register new users to the system",
      href: "/admin/addMembers",
      icon: <FiUsers className="text-2xl text-green-600" />,
    },
    {
      name: "Manage Items",
      description: "Add, update, or remove inventory items",
      href: "/admin/items",
      icon: <FiPackage className="text-2xl text-yellow-600" />,
    },
    {
      name: "Scanners",
      description: "View and control individual scanners",
      href: "/admin/scanner",
      icon: <FiRadio className="text-2xl text-purple-600" />,
    },
  ];

  return (
    <div className="max-w-xl w-full m-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Admin</h1>
      <p className="text-gray-500 mb-8 text-center">
        Quick access to all administrative features.
      </p>
      <div className="grid grid-cols-1 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.name}
            href={feature.href}
            className="flex items-center p-5 bg-gray-50 rounded-xl border hover:shadow transition group"
          >
            <div className="mr-4">{feature.icon}</div>
            <div>
              <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                {feature.name}
              </div>
              <div className="text-sm text-gray-500">{feature.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}