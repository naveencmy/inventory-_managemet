const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export async function fetchJSON<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = opts

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (auth) {
    const token = getToken()
    if (!token) {
      throw new Error("No token found")
    }
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(BASE_URL + path, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    throw new Error(data.message || "API error")
  }

  return data
}

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    fetchJSON("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  register: (name: string, email: string, password: string) =>
    fetchJSON("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    }),

  createWorker: (name: string, email: string, password: string) =>
    fetchJSON("/api/auth/create-worker", {
      method: "POST",
      body: { name, email, password },
      auth: true,
    }),
}

// Products endpoints
export const productsAPI = {
  list: () => fetchJSON("/api/products", { auth: true }),

  create: (name: string, price: number, qty: number) =>
    fetchJSON("/api/products", {
      method: "POST",
      body: { name, price, qty },
      auth: true,
    }),
}

// Sales endpoints
export const salesAPI = {
  create: (productId: number, qty: number) =>
    fetchJSON("/api/sales", {
      method: "POST",
      body: { productId, qty },
      auth: true,
    }),
}

// Reports endpoints
export const reportsAPI = {
  sales: (from: string, to: string) =>
    fetchJSON(`/api/admin/reports/sales?from=${from}&to=${to}`, {
      auth: true,
    }),

  finance: (from: string, to: string) =>
    fetchJSON(`/api/admin/reports/finance?from=${from}&to=${to}`, {
      auth: true,
    }),
}

// Payments endpoints
export const paymentsAPI = {
  create: (data: {
    sale_id?: number
    purchase_id?: number
    amount: number
    method: string
    status: string
  }) =>
    fetchJSON("/api/payments", {
      method: "POST",
      body: data,
      auth: true,
    }),
}
