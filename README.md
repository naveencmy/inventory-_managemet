# InventoryApp Frontend

Production-ready React frontend for the InventoryApp inventory management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**
  - Login with email/password
  - Create worker accounts (admin only)
  - Protected routes with role-based access control
  - Automatic token refresh and session management

- **Admin Dashboard**
  - Sales metrics and revenue tracking
  - Top products overview
  - Product inventory management
  - Sales transaction recording

- **Reports & Analytics**
  - Sales charts with date range filtering
  - Financial reports with outstanding balances
  - CSV export functionality
  - Real-time data visualization with Recharts

- **Security**
  - JWT-based authentication
  - Bearer token injection in API calls
  - Automatic 401 redirect on auth failure
  - Role-based route protection

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** React Context API
- **API:** Fetch API with custom client wrapper
- **Charts:** Recharts
- **Database Integration:** API-based (compatible with Express backend)

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and update the API base URL:

\`\`\`bash
cp .env.example .env.local
\`\`\`

\`\`\`
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Structure

\`\`\`
app/
├── layout.tsx                    # Root layout with AuthProvider
├── page.tsx                      # Home redirect to login
├── login/
│   └── page.tsx                 # Login page
├── (auth)/
│   ├── layout.tsx               # Auth routes layout
│   └── create-worker/page.tsx   # Create worker form
├── admin/
│   ├── dashboard/page.tsx       # Dashboard overview
│   └── reports/page.tsx         # Detailed reports & analytics
├── products/
│   └── page.tsx                 # Products inventory page
├── sales/
│   └── page.tsx                 # Sales transaction page
├── 403/
│   └── page.tsx                 # Access denied page
└── globals.css                   # Global styles

components/
├── navbar.tsx                    # Navigation bar
├── protected-route.tsx           # Route protection wrapper
├── stats-tile.tsx                # Stats card component
└── sales-chart.tsx              # Sales line chart component

context/
├── auth-context.ts               # Auth context definition
└── auth-provider.tsx             # Auth provider component

hooks/
└── use-auth.ts                   # useAuth hook

lib/
├── api-client.ts                 # API client with fetch wrapper
└── types.ts                      # TypeScript type definitions
\`\`\`

## API Endpoints

All endpoints require Bearer token authentication (except login):

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/create-worker` - Create worker account (admin only)

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product

### Sales
- `POST /api/sales` - Create new sale

### Reports
- `GET /api/admin/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD` - Sales report
- `GET /api/admin/reports/finance?from=YYYY-MM-DD&to=YYYY-MM-DD` - Financial report

### Payments
- `POST /api/payments` - Record payment

## Demo Credentials

\`\`\`
Email: admin@test.com
Password: pass
Role: admin
\`\`\`

## Security Notes

### Current Implementation (Development)

This frontend uses **localStorage** for JWT token storage. This is acceptable for proof-of-concept and development but has security limitations:

- Vulnerable to XSS attacks
- Tokens persist until manually cleared
- No automatic cleanup on browser close

### Production Recommendations

For production deployment:

1. **Implement httpOnly Cookies**
   - Server sets secure, httpOnly cookies with tokens
   - Eliminates localStorage XSS vulnerability
   - Automatic cleanup on session end

2. **Add CSRF Protection**
   - Implement CSRF tokens for state-changing requests
   - Use SameSite cookie attributes

3. **Enable CORS Properly**
   - Whitelist trusted domains only
   - Use credentials mode: 'include' for cookie-based auth

4. **Add Request Signing**
   - Sign API requests with timestamp
   - Prevent request replay attacks

5. **Implement Rate Limiting**
   - Client-side: Debounce rapid API calls
   - Server-side: Rate limit by user/IP

### Implementation Example

\`\`\`typescript
// Future: httpOnly cookie-based auth
export async function fetchJSON<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const response = await fetch(BASE_URL + path, {
    method: opts.method || "GET",
    headers: opts.headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include', // Send cookies
  })
  // ... rest of implementation
}
\`\`\`

## Testing

### Manual Testing Checklist

- [ ] Login with demo credentials
- [ ] Create new worker account (admin)
- [ ] View products and sales
- [ ] Create new product
- [ ] Record sales transaction
- [ ] View sales reports with date filter
- [ ] Export report to CSV
- [ ] Verify unauthorized access redirects to login
- [ ] Verify 403 error for insufficient permissions
- [ ] Test logout functionality

### Postman Collection

Import the Postman collection to test all API endpoints:

1. **Login**
   \`\`\`
   POST http://localhost:3001/api/auth/login
   Body: { "email": "admin@test.com", "password": "pass" }
   \`\`\`

2. **Create Worker**
   \`\`\`
   POST http://localhost:3001/api/auth/create-worker
   Headers: Authorization: Bearer <token>
   Body: { "name": "John Doe", "email": "john@example.com", "password": "pass" }
   \`\`\`

3. **Create Product**
   \`\`\`
   POST http://localhost:3001/api/products
   Headers: Authorization: Bearer <token>
   Body: { "name": "Product Name", "price": 29.99, "qty": 100 }
   \`\`\`

4. **Create Sale**
   \`\`\`
   POST http://localhost:3001/api/sales
   Headers: Authorization: Bearer <token>
   Body: { "productId": 1, "qty": 5 }
   \`\`\`

5. **Get Sales Report**
   \`\`\`
   GET http://localhost:3001/api/admin/reports/sales?from=2025-01-01&to=2025-12-31
   Headers: Authorization: Bearer <token>
   \`\`\`

## Performance Optimization

- **Code Splitting:** Next.js automatically code-splits routes
- **Image Optimization:** Use next/image for optimized images
- **Caching:** API responses cached using SWR (can be added)
- **Bundle Analysis:** Run `next build --analyze` to inspect bundle

## Known Limitations

1. **localStorage for JWT:** See security notes above
2. **No offline support:** Requires active network connection
3. **No real-time updates:** Implement WebSockets for live data
4. **Limited pagination:** API calls fetch all data; add pagination for large datasets

## Future Enhancements

- [ ] Add real-time notifications using WebSockets
- [ ] Implement SWR for better data fetching and caching
- [ ] Add user preferences and settings
- [ ] Implement dark mode toggle
- [ ] Add pagination for large datasets
- [ ] Add email notifications
- [ ] Implement audit logging
- [ ] Add 2FA/MFA support
- [ ] Create mobile app with React Native

## Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

\`\`\`bash
# Build for production
npm run build

# Start production server
npm run start
\`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
\`\`\`

## Troubleshooting

### 401 Unauthorized Error
- Verify token is stored in localStorage
- Check API base URL is correct
- Ensure backend is running and accessible

### CORS Errors
- Verify backend CORS headers allow your frontend origin
- Check credentials mode in fetch requests

### Missing Products/Sales
- Verify backend database is seeded with test data
- Check authorization headers are being sent

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

## License

MIT
# inventory-_managemet
