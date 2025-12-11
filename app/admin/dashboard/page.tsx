"use client"

import { Navbar } from "@/components/navbar"
import { StatsTile } from "@/components/stats-tile"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { reportsAPI } from "@/lib/api-client"
import type { SalesReport } from "@/lib/types"

export default function DashboardPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const from = thirtyDaysAgo.toISOString().split("T")[0]
        const to = today.toISOString().split("T")[0]

        const data = await reportsAPI.sales(from, to)
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [])

  const todaySales = report?.byDay[report.byDay.length - 1]?.total || 0
  const topProduct = report?.topProducts[0]

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsTile title="Today's Sales" value={`$${todaySales.toFixed(2)}`} subtitle="Last 24 hours" />
                <StatsTile
                  title="Total Revenue"
                  value={`$${report?.totalSales.toFixed(2) || "0.00"}`}
                  subtitle="Last 30 days"
                />
                <StatsTile
                  title="Top Product"
                  value={topProduct?.name || "N/A"}
                  subtitle={`${topProduct?.qtySold || 0} units sold`}
                />
                <StatsTile title="Products Listed" value={report?.topProducts.length || "0"} subtitle="In inventory" />
              </div>

              {report?.topProducts && report.topProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Product</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Units Sold</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.topProducts.map((product) => (
                          <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-900">{product.name}</td>
                            <td className="py-3 px-4 text-right text-gray-900">{product.qtySold}</td>
                            <td className="py-3 px-4 text-right text-gray-900 font-medium">
                              ${product.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
