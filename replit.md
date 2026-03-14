# TuniOlive - Premium Mediterranean Olive Oil Website

## Overview
A Next.js 15 marketing and admin website for TuniOlive, a premium olive oil brand. Includes a public-facing product/contact page and a password-protected admin panel for managing clients and invoices via an Excel file.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Language**: TypeScript
- **Package Manager**: npm

## Key Directories
- `app/` — Next.js App Router pages and API routes
  - `app/api/send-email/` — Nodemailer contact form email API
  - `app/api/data/` — Excel file read/write API for admin panel
  - `app/admin/` — Password-protected admin area
  - `app/login/` — Admin login page
  - `app/products/` — Products page
- `components/` — Shared UI components
- `contexts/` — React context providers
- `data/` — Local Excel data file (TuniOlive.xlsx)
- `translations/` — i18n translation files
- `models/` — TypeScript type definitions
- `public/` — Static assets

## Environment Variables Required
The following secrets must be set for the email contact form to work:
- `SMTP_HOST` — SMTP server hostname
- `APP_USER` — SMTP account username/email
- `APP_PASSWORD` — SMTP account password or app password
- `APP_SEND_TO` — Email address to receive contact form submissions

## Replit Configuration
- **Port**: 5000 (dev and production)
- **Run command**: `npm run dev` (via "Start application" workflow)
- **Node version**: 20

## Security Notes
- A hardcoded app password was removed from `app/api/send-email/route.ts` during Replit migration — use the `APP_PASSWORD` environment variable instead.
- Admin authentication is handled via a password stored in `APP_PASSWORD` env var.
