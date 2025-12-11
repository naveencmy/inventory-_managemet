"use client"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center font-bold text-xl">
              InventoryApp
            </Link>
            {user?.role && ["admin", "superadmin"].includes(user.role) && (
              <div className="hidden md:flex gap-6">
                <Link href="/admin/reports" className="text-gray-700 hover:text-blue-600 transition">
                  Reports
                </Link>
                <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">
                  Products
                </Link>
                <Link href="/sales" className="text-gray-700 hover:text-blue-600 transition">
                  Sales
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
