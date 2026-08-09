# Growth Site AI

AI Website Growth Platform - Master Development Specification

Project Summary

Production-ready AI Website Growth Platform built with Next.js + Supabase. Dark-first premium UI using Black, White, Forest Green, and Maroon. Completely free with no payment system.





OptiSite AI is the name 

Tech Stack

Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion.

Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions, RLS).

Deployment: Vercel + Supabase.

Core Modules

Landing, Authentication, Dashboard, Website Audit, SEO, Performance, Security, Accessibility, Competitor Comparison, Reports, Settings, Profile, Help.

Design System

Colors: Black #0A0A0A, White #FFFFFF, Forest Green #1B5E20, Maroon #5A1A1A. Dark-first, glassmorphism, responsive, accessible.

Authentication

Email/password, Google OAuth, reset password, protected routes, session refresh, RLS.

Database

Tables: profiles, audits, audit_results, reports, competitors, usage_logs, settings.

Security

HTTPS, RLS, validation, rate limiting, env variables, no service role key on frontend.

Audit Flow

URL validation → AI audit → save results → dashboard update → PDF report.

Free Platform

No Stripe, billing, subscriptions, pricing pages or feature gating. Unlimited audits and reports for all users.

Quality

No placeholder code, no TODOs, reusable components, strict TypeScript, lint/type/build clean, responsive, accessible, production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://opti-site-grow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f62797c4-f709-421e-9f0a-76878e5f3941).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
