"use client"

import { Navbar } from "@/components/navbar"
import { SalesChart } from "@/components/sales-chart"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, useEffect } from "react"
import { reportsAPI } from "@/lib/api-client"
import type { SalesReport, FinanceReport } from "@/lib/types"

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [sales, finance] = await Promise.all([
          reportsAPI.sales(dateRange.from, dateRange.to),
          reportsAPI.finance(dateRange.from, dateRange.to),
        ])
        setSalesReport(sales)
        setFinanceReport(finance)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [dateRange])

  const exportToCSV = () => {
    if (!salesReport) return

    const headers = ["Date", "Total Sales"]
    const rows = salesReport.byDay.map((item) => [item.date, item.total])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${dateRange.from}-${dateRange.to}.csv`
    a.click()
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-2">Sales and financial analytics</p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export to CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {salesReport && <SalesChart data={salesReport.byDay} />}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${salesReport?.totalSales.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-600">Total Debits</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${financeReport?.totalDebits.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${(financeReport?.partialBalances.reduce((sum, pb) => sum + pb.outstanding, 0) || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {financeReport?.partialBalances && financeReport.partialBalances.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Outstanding Balances</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Customer</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Invoice ID</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Outstanding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financeReport.partialBalances.map((balance, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-900">{balance.customer}</td>
                            <td className="py-3 px-4 text-right text-gray-900">{balance.invoiceId}</td>
                            <td className="py-3 px-4 text-right text-gray-900 font-medium">
                              ${balance.outstanding.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
