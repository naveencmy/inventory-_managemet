export interface User {
  id: number
  name?: string
  email: string
  role: "worker" | "admin" | "superadmin"
}

export interface Product {
  id: number
  name: string
  price: number
  qty: number
}

export interface Sale {
  id: number
  product_id: number
  qty: number
  created_at: string
}

export interface Payment {
  id: number
  sale_id?: number
  purchase_id?: number
  amount: number
  method: string
  status: string
  created_at: string
}

export interface SalesReport {
  totalSales: number
  byDay: Array<{ date: string; total: number }>
  topProducts: Array<{
    id: number
    name: string
    qtySold: number
    revenue: number
  }>
}

export interface FinanceReport {
  totalRevenue: number
  totalDebits: number
  partialBalances: Array<{
    customer: string
    invoiceId: number
    outstanding: number
  }>
  payments: Payment[]
}
