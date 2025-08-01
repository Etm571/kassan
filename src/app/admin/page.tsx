import Link from "next/link";
import { FiUsers, FiPackage, FiRadio, FiHome } from "react-icons/fi";
import { auth } from "@/../auth.config";

export default async function AdminHome() {
  const session = await auth();

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
      href: "/admin/management/users",
      icon: <FiUsers className="text-2xl text-green-600" />,
    },
    {
      name: "Manage Items",
      description: "Add, update, or remove inventory items",
      href: "/admin/management/items",
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Welcome{session?.user?.name ? `, ${session.user.name}` : " Admin"}
      </h1>
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
