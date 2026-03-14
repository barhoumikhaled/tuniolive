# TuniOlive - Premium Mediterranean Olive Oil Website

## Overview
A Next.js 15 marketing, e-commerce, and admin website for TuniOlive, a premium olive oil brand. Includes a public-facing product/contact page with Stripe-powered e-commerce, and a password-protected admin panel for managing clients and invoices via an Excel file.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Language**: TypeScript
- **Package Manager**: npm
- **Payments**: Stripe (Checkout Sessions)
- **Email**: Nodemailer (SMTP)

## Key Directories
- `app/` — Next.js App Router pages and API routes
  - `app/api/checkout/route.ts` — Stripe Checkout Session creation API
  - `app/api/checkout/session/route.ts` — Retrieve Stripe session details for order summary
  - `app/api/webhook/` — Stripe webhook handler for order completion
  - `app/checkout/page.tsx` — Cart review and checkout page
  - `app/api/send-email/` — Nodemailer contact form email API
  - `app/api/data/` — Excel file read/write API for admin panel
  - `app/checkout/success/` — Post-payment success page
  - `app/checkout/cancel/` — Payment cancelled page
  - `app/admin/` — Password-protected admin area
  - `app/login/` — Admin login page
  - `app/products/` — Products page with detail pages
- `components/` — Shared UI components
  - `components/cart-drawer.tsx` — Cart sidebar drawer
- `contexts/` — React context providers
  - `contexts/cart-context.tsx` — Shopping cart state management
  - `contexts/language-context.tsx` — i18n language provider
- `utils/` — Utility functions
  - `utils/send-order-email.ts` — Order notification email sender
- `data/` — Local Excel data file (TuniOlive.xlsx)
- `translations/` — i18n translation files (en, fr, ar)
- `models/` — TypeScript type definitions
- `public/` — Static assets

## Environment Variables Required

### Email (contact form + order notifications)
- `SMTP_HOST` — SMTP server hostname
- `APP_USER` — SMTP account username/email
- `APP_PASSWORD` — SMTP account password or app password
- `APP_SEND_TO` — Email address to receive contact form and order notifications

### Stripe (e-commerce)
- `STRIPE_SECRET_KEY` — Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

## E-commerce Flow
1. Customer adds products to cart from homepage or product detail pages
2. Cart state persists to localStorage (key: "tuniolive-cart") across page reloads
3. Cart drawer shows items with quantity controls
4. "Proceed to Checkout" navigates to `/checkout` review page
5. Checkout page shows full cart with quantity controls and order summary
6. Clicking "Proceed to Checkout" on the checkout page creates a Stripe Checkout Session and redirects to Stripe
7. After payment, Stripe sends a webhook to `/api/webhook`
8. Webhook triggers an order notification email to the store owner
9. Customer sees success page with order summary (retrieved via `/api/checkout/session`)
10. Cart is cleared after successful payment

## Replit Configuration
- **Port**: 5000 (dev and production)
- **Run command**: `npm run dev` (via "Start application" workflow)
- **Node version**: 20

## Security Notes
- A hardcoded app password was removed from `app/api/send-email/route.ts` during Replit migration — use the `APP_PASSWORD` environment variable instead.
- All Stripe keys and SMTP credentials are stored as environment variables.
- Stripe webhook endpoint verifies signatures to prevent spoofed events.
