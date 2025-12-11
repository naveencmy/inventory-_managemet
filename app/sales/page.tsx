"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, useEffect } from "react"
import { productsAPI, salesAPI } from "@/lib/api-client"
import type { Product } from "@/lib/types"

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsAPI.list()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      await salesAPI.create(Number.parseInt(selectedProductId), Number.parseInt(quantity))
      setSuccess("Sale created successfully!")
      setSelectedProductId("")
      setQuantity("")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sale")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === Number.parseInt(selectedProductId))
  const saleTotal = selectedProduct ? selectedProduct.price * Number.parseInt(quantity || 0) : 0

  return (
    <ProtectedRoute allowedRoles={["admin", "worker", "superadmin"]}>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Sale</h1>
            <p className="text-gray-600 mt-2">Record a new sale transaction</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {isLoading ? (
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)} (Stock: {product.qty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="0"
                  />
                </div>

                {selectedProduct && quantity && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Sale Summary</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-gray-900">
                        <span>{selectedProduct.name}</span>
                        <span>{quantity} units</span>
                      </div>
                      <div className="flex justify-between text-gray-900">
                        <span>Unit Price</span>
                        <span>${selectedProduct.price.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>${saleTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProductId || !quantity}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Creating Sale..." : "Complete Sale"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}
