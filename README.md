# Pescadero Music — Client Portal

A custom client portal for Pescadero Music built with Next.js 14 + Supabase.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.local` (already included — DO NOT commit this file).
Make sure your Supabase URL and keys are set.

### 3. Run the Supabase schema
- Go to supabase.com → your project → SQL Editor
- Paste and run the contents of `supabase_schema.sql`

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Vercel
- Push this repo to GitHub
- Go to vercel.com → New Project → Import your repo
- Add environment variables in Vercel dashboard (same as .env.local)
- Deploy

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard or login |
| `/auth/login` | Client login |
| `/auth/signup` | New client signup |
| `/inquiry` | Inquiry form (Step 1) |
| `/dashboard` | Client step tracker |
| `/contract` | Contract view (Step 2) |
| `/planning` | Planning form (Step 4) |
| `/admin` | Garrett's admin panel |

## Admin access
Go to `/admin` — only accessible when logged in as `garrett@pescaderomusic.com`.
From there you can update each client's step status (contract sent, deposit paid, etc.)
which automatically unlocks the next step in their dashboard.

## Step flow
```
Inquiry (auto-complete on submit)
  → Contract (you mark as "sent" in admin → client sees it → you mark "signed")  
  → Deposit (you mark "paid" → unlocks planning form)
  → Planning Form (client submits → you mark "submitted")
  → Consultation (you mark "complete" after the call)
  → Event Day
```
