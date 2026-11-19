# 🛒 Grocery Store Frontend

A full-featured, modern **frontend** for an online Grocery Store application built with **Vue 3**, **Vuetify 3**, and **TypeScript**. It provides a smooth shopping experience for customers and a powerful dashboard for admins — with real-time notifications, multilingual support, voice search, dark mode, and much more.

## Live Demo
- Register your self as consumer and explore
  **Public URL:** https://hp-headless.tail53b0ae.ts.net

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Components Overview](#-components-overview)
- [Composables](#-composables)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Backend Integration](#-backend-integration)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| **Vue 3** | ^3.5.21 | Frontend framework (Composition API + `<script setup>`) |
| **Vuetify 3** | ^3.10.2 | Material Design UI component library |
| **TypeScript** | ~5.8.3 | Static typing |
| **Vite** | ^7.1.6 | Build tool and dev server |
| **Vue Router** | ^4.5.1 | Client-side routing with role-based guards |
| **Pinia** | ^3.0.4 | State management (toast + confirm dialogs) |
| **Axios** | ^1.13.2 | HTTP client with request/response interceptors |
| **Vue I18n** | ^9.14.5 | Multilingual support (English, Hindi, Marathi) |
| **ApexCharts** | ^5.3.5 | Interactive charts (area, bar) for dashboard |
| **vue3-apexcharts** | ^1.8.0 | Vue wrapper for ApexCharts |
| **SockJS + STOMP.js** | ^1.6.1 / ^2.3.3 | WebSocket client for real-time stock updates |
| **jwt-decode** | ^4.0.0 | JWT token decoding on the client side |
| **@mdi/font** | ^7.4.47 | Material Design Icons |

---

## ✨ Features

### 👤 Customer Features
- 🔐 **Login & Registration** — Email/password auth with form validation
- 🏠 **Home Page** — Featured products + product listing with search
- 🔍 **Voice Search** — Search products using your microphone (multilingual: EN/HI/MR)
- 📦 **Product Catalog** — Filter by category, paginated product listing
- 🔎 **Product Detail** — View product info, variants, and related products
- ❤️ **Wishlist** — Add/toggle products in wishlist from any product card
- 🛒 **Cart** — Add to cart (via AppLayout injection), adjust quantities
- 💳 **Checkout** — Select saved address or add new one, choose payment method (COD, UPI, Card, BHIM)
- 📜 **Order History** — View all past orders with status and item details
- 👤 **Profile** — View and update name, mobile, address, city, pincode
- 🌐 **Language Switcher** — Switch between English, Hindi, Marathi at login screen

### 🔧 Admin Features
- 📊 **Dashboard** — Revenue, total orders, pending orders, items sold; Sales trend chart; Best sellers chart; date range filter (7/15/30 days or custom)
- 👥 **User Management** — Paginated + searchable user list; create users; change roles; toggle account status (Activate/Deactivate); view user's purchase history
- 📦 **Product Management** — Full CRUD with image upload & preview; mark as featured; assign category; manage stock & price
- 🏷️ **Category Management** — Create, edit, soft-delete categories; debounced search
- 📋 **Order Management** — View all orders; update single order status; **bulk status update** with checkbox selection
- 📈 **Reports** — View low-stock inventory & best-selling products; export full PDF report with date range
- ⚙️ **Settings** — Configure store name, address, contact; payment methods; delivery options & fee; live dark/light theme toggle + primary brand color picker

### 🎨 UI / UX
- 🌙 **Dark / Light Mode** — Theme persisted in `localStorage`, toggled from settings
- 🎨 **Custom Brand Color** — Live color picker updates Vuetify's primary color across the whole app
- 📱 **Responsive Layout** — Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** — Global success/error/warning snackbar via Pinia store
- ✅ **Confirm Dialogs** — Native modal-based confirm dialogs (not browser `confirm()`)
- ⚡ **Debounced Search** — All admin tables use debounced search to reduce API calls
- 🔄 **Session Expiry** — Admin gets a prompt to extend session 2 min before expiry; customer is auto-logged out

---

## 📁 Project Structure

```
src/
│
├── App.vue                          # Root component (theme init, WebSocket connect, toast/confirm overlay)
├── main.ts                          # App bootstrap (Vuetify, Pinia, Router, I18n setup)
├── axios.ts                         # Axios instance with request/response interceptors
├── i18n.ts                          # Vue I18n setup (en, hi, mr locales)
├── style.css                        # Global base styles
│
├── assets/
│   └── global.css                   # App-wide CSS variables and utilities
│
├── locales/
│   ├── en.json                      # English translations
│   ├── hi.json                      # Hindi translations
│   └── mr.json                      # Marathi translations
│
├── components/
│   ├── Admin/
│   │   ├── AdminDashboard.vue       # Stats cards, Sales Trend chart, Best Sellers chart
│   │   ├── AdminUserManagement.vue  # User CRUD, role change, status toggle, order history view
│   │   ├── AdminProductMangement.vue # Product CRUD, image upload, featured toggle
│   │   ├── AdminCategoryManagement.vue # Category CRUD with debounced search
│   │   ├── AdminOrderManagement.vue # Order list, single/bulk status update
│   │   ├── AdminReports.vue         # Low stock + best sellers tables, PDF export
│   │   └── AdminSettings.vue        # Store info, logistics, theme/color settings
│   │
│   ├── Auth/
│   │   ├── Login.vue                # Combined Login + Signup tabs; language switcher
│   │   └── Profile.vue              # View/edit user profile (shared by customer & admin)
│   │
│   ├── Checkout/
│   │   └── Checkout.vue             # Address selection/creation, payment method, cart summary
│   │
│   ├── Home/
│   │   └── Home.vue                 # Featured products + all products grid
│   │
│   ├── Order/
│   │   └── OrderHistory.vue         # Customer's past orders list
│   │
│   ├── Products/
│   │   ├── Products.vue             # Product listing with category filter + search
│   │   └── ProductDetail.vue        # Single product view with variants and related products
│   │
│   └── common/
│       ├── AppLayout.vue            # Customer layout: navbar, search bar, cart drawer
│       ├── AdminLayout.vue          # Admin layout: side navigation drawer
│       ├── AppTable.vue             # Reusable paginated data table wrapper
│       ├── IconButton.vue           # Reusable icon button component
│       └── ProductCard.vue          # Product card with wishlist toggle
│
├── composables/
│   ├── useAuth.ts                   # Auth state, login, logout, token refresh, session timer
│   ├── useNotify.ts                 # Toast & confirm dialog helper (wraps toastStore)
│   ├── useSocket.ts                 # WebSocket (STOMP over SockJS) connect/disconnect/subscribe
│   └── useSpeechToText.ts          # Web Speech API wrapper for voice search (EN/HI/MR)
│
├── stores/
│   └── toastStore.ts               # Pinia store: toast notifications + confirm dialog state
│
└── router/
    ├── index.ts                     # Main router: customer routes + navigation guard
    └── adminRoutes.ts              # Admin routes (lazy structured, nested under AdminLayout)
```

---

## 🗺 Pages & Routes

### Customer Routes (requires `ROLE_CUSTOMER`)

| Path | Component | Description |
|:-----|:----------|:------------|
| `/login` | `Login.vue` | Login form |
| `/signup` | `Login.vue` | Registration form (same component, different tab) |
| `/home` | `Home.vue` | Home page with featured & all products |
| `/product` | `Products.vue` | Product listing with category filter & search |
| `/product/:id` | `ProductDetail.vue` | Product detail with variants |
| `/checkout` | `Checkout.vue` | Order checkout with address & payment |
| `/profile` | `Profile.vue` | View & edit profile |
| `/orderHistory` | `OrderHistory.vue` | Customer's order history |

### Admin Routes (requires `ROLE_ADMIN`)

| Path | Component | Description |
|:-----|:----------|:------------|
| `/admin` | `AdminDashboard.vue` | Dashboard with stats & charts |
| `/admin/profile` | `Profile.vue` | Admin's own profile |
| `/admin/users` | `AdminUserManagement.vue` | User management |
| `/admin/products` | `AdminProductMangement.vue` | Product management |
| `/admin/categories` | `AdminCategoryManagement.vue` | Category management |
| `/admin/orders` | `AdminOrderManagement.vue` | Order management |
| `/admin/reports` | `AdminReports.vue` | Business reports & PDF export |
| `/admin/settings` | `AdminSettings.vue` | App settings |

### Route Guard Behaviour
- **Unauthenticated users** → redirected to `/login`
- **Logged-in users** visiting `/login` or `/signup` → redirected to `/home` (customer) or `/admin` (admin)
- **Customers** trying to access `/admin/*` → redirected to `/home`
- **Admins** trying to access customer pages → redirected to `/admin`
- **Unknown paths** (`/:catchAll(.*)`) → redirect to `/login`

---

## 🧩 Components Overview

### Common Components

| Component | Purpose |
|:----------|:--------|
| `AppLayout.vue` | Customer-facing wrapper: top navbar, debounced search bar (with voice search), cart side drawer, dark/light toggle |
| `AdminLayout.vue` | Admin-facing wrapper: side navigation drawer with links to all admin sections |
| `AppTable.vue` | Generic reusable data table with built-in pagination, loading state, and slot for action column |
| `ProductCard.vue` | Product display card with image, name, price, and ❤️ wishlist toggle button |
| `IconButton.vue` | Small reusable icon-only button with tooltip support |

### Admin Components

| Component | Key Features |
|:----------|:-------------|
| `AdminDashboard.vue` | 4 stat cards (Revenue, Orders, Pending, Items Sold); ApexCharts area chart for sales trend; bar chart for best sellers; 7/15/30-day + custom date range selector |
| `AdminUserManagement.vue` | Searchable paginated user table; create user dialog (with address); change role dialog; toggle ACTIVE/INACTIVE status; view order history popup |
| `AdminProductMangement.vue` | Searchable paginated product table; add/edit dialog with file input, image preview, featured toggle, category dropdown, price/stock/status fields |
| `AdminCategoryManagement.vue` | Searchable paginated category table; add/edit dialog; soft-delete with confirm |
| `AdminOrderManagement.vue` | Searchable paginated order table; color-coded status chips; single update dialog; checkbox multi-select for bulk status update |
| `AdminReports.vue` | Low-stock inventory table; best-selling products table with progress bar; range selector; Export PDF button |
| `AdminSettings.vue` | Store name/address/contact; payment methods multi-select; delivery options + fee; dark mode switch; primary brand color picker (live preview) |

---

## 🔧 Composables

### `useAuth.ts`
Manages the full authentication lifecycle:
- `initAuth()` — On app start, reads token from `localStorage`, validates against `/auth/check`, restores session
- `login(email, password)` — Calls `/auth/login`, stores JWT in `localStorage`, sets up session timer
- `logout()` — Clears token, user, theme from `localStorage`, redirects to `/login`
- `refreshToken()` — Calls `/auth/refresh` to get a new token
- **Session Timer** — Admin gets a 2-minute warning prompt before token expiry; customers are silently logged out

### `useSocket.ts`
WebSocket connection using SockJS + STOMP:
- Connects to `/ws-grocery` endpoint on the backend
- Subscribes to `/topic/stock` for real-time stock updates
- `onStockUpdate(callback)` — Any component can listen to stock changes
- Auto-reconnects on failure (5-second retry)
- Singleton: only one global connection is maintained

### `useSpeechToText.ts`
Voice search using the browser's Web Speech API:
- `startListening(callback)` — Starts recognition, fires callback with transcript when done
- Automatically maps UI language to speech locale (`en` → `en-IN`, `hi` → `hi-IN`, `mr` → `mr-IN`)
- Plays audio feedback on mic start and successful recognition

### `useNotify.ts`
Convenience wrapper around `toastStore`:
- `notify.success(message)` — Green toast
- `notify.error(message)` — Red toast
- `notify.warning(message)` — Yellow toast
- `notify.confirm(title, message)` — Returns a `Promise<boolean>` — shows a modal dialog

---

## 🗃 State Management

### `toastStore.ts` (Pinia)
Global store for UI feedback:

```
State:
  show          → boolean (toast visibility)
  message       → string
  type          → 'success' | 'error' | 'warning'
  timeout       → 3500ms default
  confirmShow   → boolean (confirm dialog visibility)
  confirmTitle  → string
  confirmMessage→ string

Actions:
  showToast(msg, type)         → shows a snackbar toast
  confirm(title, message)      → shows confirm dialog, returns Promise<boolean>
  handleConfirm(result)        → resolves the confirm Promise
```

---

## 🌐 API Integration

### Axios Instance (`src/axios.ts`)

All API calls go through a single configured Axios instance:

```
Base URL: import.meta.env.VITE_BASE_API_URL
```

**Request Interceptor** — Attaches the JWT token to every request:
```
Header: user-payload: <token from localStorage>
```

**Response Interceptor:**
- ✅ On success: auto-shows a toast with `response.data.message` if `success === true`
- ❌ On 401: shows "Session expired" toast, calls `logout()`, redirects to `/login`
- Returns `response.data.data` directly (unwraps the API response wrapper)

### API Calls by Component

| Component | API Calls Made |
|:----------|:--------------|
| `useAuth.ts` | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/check` |
| `Login.vue` | `POST /auth/register` |
| `Home.vue` | `GET /products/featured`, `GET /products/getProducts` |
| `Products.vue` | `GET /products/getProducts`, `GET /categories` |
| `ProductDetail.vue` | `GET /products/getProducts/:id`, `GET /products/getProducts?q=` |
| `ProductCard.vue` | `POST /wishlist/addWishList/:productId` |
| `AppLayout.vue` | `GET /products/getProducts?q=` (search) |
| `Checkout.vue` | `GET /address`, `POST /address`, `POST /orders/place` |
| `OrderHistory.vue` | `GET /orders/my-orders` |
| `Profile.vue` | `GET /users/me`, `PUT /users/update-profile` |
| `AdminDashboard.vue` | `GET /admin/dashboard/stats?range=&startDate=&endDate=` |
| `AdminUserManagement.vue` | `GET /admin/getusers`, `POST /admin/create-user`, `PATCH /admin/users/:id`, `GET /admin/orders/user/:id` |
| `AdminProductMangement.vue` | `GET /admin/products`, `GET /admin/categories`, `POST /admin/products`, `PUT /admin/products/:id`, `DELETE /admin/products/:id`, `POST /admin/products/images/product/:id` |
| `AdminCategoryManagement.vue` | `GET /admin/categories`, `POST /admin/categories`, `PUT /admin/categories/:id`, `DELETE /admin/categories/:id` |
| `AdminOrderManagement.vue` | `GET /admin/orders/all`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/bulk-status` |
| `AdminReports.vue` | `GET /admin/dashboard/stats`, `GET /admin/dashboard/reports/export-full` |
| `AdminSettings.vue` | `GET /admin/settings`, `PUT /admin/settings` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **pnpm** (or npm/yarn)
- Backend running at `http://localhost:8080`

### 1. Clone the Repository

```bash
git clone https://github.com/Niranjan-4975/grocery-store-frontend.git
cd grocery-store
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_BASE_API_URL=http://localhost:8080/api
VITE_BASE_URL=http://localhost:8080
VITE_IMAGE_API_URL=http://localhost:8080
```

### 4. Start the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
pnpm build
```

### 6. Preview Production Build

```bash
pnpm preview
```

---

## ⚙ Environment Variables

| Variable | Description | Example |
|:---------|:------------|:--------|
| `VITE_BASE_API_URL` | Base URL for all API calls | `http://localhost:8080/api` |
| `VITE_BASE_URL` | Base URL for WebSocket connection | `http://localhost:8080` |
| `VITE_IMAGE_API_URL` | Base URL prefix for product images | `http://localhost:8080` |

> Product image paths returned by the backend are relative (e.g. `/uploads/products/image.jpg`). The frontend prefixes them with `VITE_IMAGE_API_URL` to build the full URL.

---

## 🔗 Backend Integration

This frontend is built to work with the **Grocery Store Backend** (Spring Boot):

| Concern | Detail |
|:--------|:-------|
| **Auth Header** | JWT sent as `user-payload` header (not `Authorization: Bearer`) |
| **API Response Format** | Backend returns `{ success, message, data, timestamp }` — the interceptor unwraps `data` automatically |
| **Image Storage** | Product images are stored on **Cloudinary** via the backend; URLs returned are relative paths |
| **WebSocket Endpoint** | Backend exposes `/ws-grocery` (STOMP over SockJS) for real-time stock updates on topic `/topic/stock` |
| **CORS** | Backend allows `http://localhost:5173` by default — configure `app.cors.allowed-origins` in backend `application-dev.properties` |

### Default Login After Setup

The backend seeds a default admin account on first run. Use it to access `/admin`:

```
Email:    admin@grocery.com   (check AdminDataSeeder.java)
Password: admin123
```

---

## 🌍 Internationalization (i18n)

The app supports **3 languages** via Vue I18n:

| Language | Code | Coverage |
|:---------|:-----|:---------|
| English | `en` | Full |
| Hindi | `hi` | Full |
| Marathi | `mr` | Full |

- Language is **persisted** in `localStorage` as `lang`
- Admins are **always set to English** after login
- **Voice Search** automatically uses the matching speech locale

---

## 📄 License

This project is for educational and personal use.

---

> Built with ❤️ using Vue 3 + Vuetify + TypeScript
