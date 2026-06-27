<div align="center">

# TimeGleam Hub

**A premium smartwatch e-commerce experience — built for speed, style, and scale.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Overview

TimeGleam Hub is a full-stack e-commerce storefront for premium smartwatches. It's built as a portfolio-grade project demonstrating real-world patterns: authenticated user flows, a full cart-to-checkout-to-invoice pipeline, interactive product visualization, and a sales analytics dashboard — all wrapped in a smooth, animated UI.

> **Stack at a glance:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Framer Motion · Supabase · TanStack Query · Recharts

---

## Features

### 🏠 Storefront
- **Animated Hero Carousel** — Five auto-advancing slides with parallax scroll driven by Framer Motion's `useScroll` + `useTransform`
- **Category Browsing** — Fitness, Luxury, Outdoor, Kids, Budget, and AMOLED collections with visual category cards
- **Brand Directory** — Dedicated brands page showcasing all watch makers in the catalogue

### 🔍 Product Discovery
- **Smart Filtering** — Filter by category, brand, price range, and features simultaneously
- **360° Product Gallery** — Drag-to-rotate viewer with momentum physics, auto-spin toggle, and pinch/scroll zoom
- **Product Detail** — Full specs, multi-color selection, strap material picker, and aggregated review scores
- **Wishlist** — Persistent wishlist with add/remove notifications

### 🛒 Cart & Checkout
- **Persistent Cart** — Global cart context with real-time quantity adjustment and subtotal calculation
- **Checkout Flow** — Address entry → order summary → payment confirmation
- **Order Success** — Confirmation screen with animated count-up stats
- **PDF Invoice** — Downloadable invoice generated client-side via jsPDF + html2canvas

### 👤 User Accounts
- **Auth** — Email/password sign-up and sign-in via Supabase Auth with protected routes
- **Profile** — View and update account details
- **Order History** — Full order list and per-order itemized detail view

### 📊 Analytics Dashboard
- **Sales Reports** — Revenue totals, order counts, and category breakdowns rendered with Recharts (Area, Pie, RadialBar)
- **Date Ranges** — One-click presets (Today / Week / Month / Quarter) plus a custom calendar range picker
- **PDF Export** — Download the current report view as a formatted PDF

### 🎨 UI Polish
- **Dark / Light Theme** — System-aware with manual toggle via `next-themes`
- **Animated Loading Screen** — Brand splash on first load
- **Toast System** — Cart and wishlist action feedback via Sonner
- **Fully Responsive** — Mobile-first, tested across breakpoints

---

## Tech Stack

| Concern | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build | Vite 5 + SWC |
| Styling | Tailwind CSS · tailwind-merge · tailwindcss-animate |
| Components | shadcn/ui (Radix UI) |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Backend & Auth | Supabase (PostgreSQL + Auth) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| Icons | Lucide React |
| Date Utilities | date-fns |
| Testing | Vitest + Testing Library |
| Package Manager | Bun *(npm compatible)* |

---

## Project Structure

```
src/
├── assets/                  # Watch and hero images
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ProductGallery360.tsx # Drag-to-rotate viewer
│   ├── CartNotification.tsx
│   ├── WishlistNotification.tsx
│   ├── LoadingScreen.tsx
│   └── CountUp.tsx
├── context/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx
│   └── ThemeContext.tsx
├── data/
│   └── products.ts          # Catalogue · categories · brands
├── pages/                   # One file per route (20 pages)
└── integrations/
    └── supabase/            # Client + generated types
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** 1+
- A [Supabase](https://supabase.com) project with Auth enabled

### 1 — Clone & Install

```bash
git clone https://github.com/your-username/time-gleam-hub.git
cd time-gleam-hub

bun install        # or: npm install
```

### 2 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> **Security note:** Never commit real credentials. `.env` is already in `.gitignore`. Rotate any keys that have been exposed.

### 3 — Run Locally

```bash
bun run dev        # http://localhost:5173
```

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with HMR |
| `bun run build` | Production build → `dist/` |
| `bun run preview` | Serve the production build locally |
| `bun run lint` | ESLint across the project |
| `bun run test` | Run tests once (Vitest) |
| `bun run test:watch` | Run tests in watch mode |

---

## Database Schema

TimeGleam Hub reads from and writes to the following Supabase tables:

| Table | Purpose |
|---|---|
| `profiles` | Extended user data (name, avatar, preferences) |
| `orders` | Order header (user, total, status, timestamps) |
| `order_items` | Line items per order (product id, qty, price snapshot) |

Refer to `src/integrations/supabase/` for TypeScript type definitions that reflect the full schema.

---

## Deployment

The output is a static SPA (`dist/`) deployable anywhere.

**Vercel (recommended)**
```bash
vercel          # or push to GitHub and import in the Vercel dashboard
```

**Netlify**
Set build command to `npm run build` and publish directory to `dist`. Add environment variables under *Site settings → Environment variables*.

**Any CDN / VPS**
Serve the `dist/` folder as static files. Ensure your server redirects all routes to `index.html` for client-side routing to work.

---

## Roadmap

- [ ] Supabase Realtime stock updates
- [ ] Stripe payment integration
- [ ] Admin product management panel
- [ ] Review & rating submission
- [ ] i18n / multi-currency support

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

Product names, brand references, and imagery within the demo dataset are illustrative only and not affiliated with real manufacturers.

---

## Acknowledgements

[shadcn/ui](https://ui.shadcn.com) · [Framer Motion](https://www.framer.com/motion/) · [Supabase](https://supabase.com) · [Lucide](https://lucide.dev) · [TanStack Query](https://tanstack.com/query)

---

<div align="center">
  <sub>Built with ☕ and TypeScript</sub>
</div>
