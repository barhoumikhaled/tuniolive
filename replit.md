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
- `data/` — Local Excel data file (TuniOlive.xlsx) + shipping rates
  - `data/shipping-rates.ts` — Canadian shipping rates by province/territory (13 regions, 3 methods each)
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
5. Checkout page shows full cart with quantity controls, shipping address form, and order summary
6. Customer fills in Canadian shipping address (street, city, province, postal code)
7. Province selection reveals shipping method options with per-province pricing
8. Orders >= $80 CAD qualify for free shipping; otherwise customer picks a method
9. Clicking "Proceed to Checkout" creates a Stripe Checkout Session (shipping validated server-side) and redirects to Stripe
10. After payment, Stripe sends a webhook to `/api/webhook`
11. Webhook triggers an order notification email (includes shipping details) to the store owner
12. Customer sees success page with order summary and masked shipping address
13. Cart is cleared after successful payment

## Shipping
- **Rates file**: `data/shipping-rates.ts` — all 13 Canadian provinces/territories
- **Methods per province**: Canada Post Expedited, Canada Post Priority, Standard (prices vary by region)
- **Free shipping threshold**: $80 CAD (`FREE_SHIPPING_THRESHOLD`)
- **Server-side validation**: API route validates province, method, and free-shipping eligibility; never trusts client-provided cost
- **PII protection**: Success page API masks address and postal code before returning to client

## Replit Configuration
- **Port**: 5000 (dev and production)
- **Run command**: `npm run dev` (via "Start application" workflow)
- **Node version**: 20

## Security Notes
- A hardcoded app password was removed from `app/api/send-email/route.ts` during Replit migration — use the `APP_PASSWORD` environment variable instead.
- All Stripe keys and SMTP credentials are stored as environment variables.
- Stripe webhook endpoint verifies signatures to prevent spoofed events.
