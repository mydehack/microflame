# CampusConnect AI

CampusConnect AI is a student networking application built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage, and a server-side AI mentor adapter. The original Northstar static files remain in the repository; the application runs from the Next.js `app/` tree.

## Current implementation

The application includes password registration and login with username, college, and password; onboarding; public/private profiles; profile field visibility; verified recovery-email enrollment and password reset; follows and private follow requests; connections; persisted create/edit/delete posts, likes, comments, and saved-post records; a structured student matching baseline; private AI mentor conversations; editable goals and milestones; communities with private join approvals; text messaging with periodic polling; notifications; blocking/reporting; and account deletion with session revocation and owned media cleanup.

The official AI account is created by the idempotent `seed:platform` command. Database onboarding creates both follow edges exactly once when each student account is inserted. User-controlled metadata cannot grant the AI account type or badge.

This is a functional foundation, not a claim that every item in the original product brief is complete. In particular, human match ranking is structured and deterministic; semantic embeddings and discovery filters, match notifications, AI-account notifications, post media and feed pagination, saved-post browsing, generated connection starters, community resources/events/tasks, realtime message delivery/read receipts, moderation tooling, and scheduled n8n workflows still need implementation. Messages are stored and sent through the database, and the UI refreshes them every 12 seconds. AI mentor calls and password recovery require server credentials and show useful configuration errors when unavailable. No real Supabase project or mail/AI credentials are included.

## Requirements

- Node.js 20.9 or newer (the project is pinned to Next.js 16).
- A Supabase project with Auth, Postgres, and Storage enabled.
- Supabase CLI for applying and validating migrations.
- Optional: an OpenAI-compatible AI API, n8n webhook endpoints, and a Resend account for recovery email.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. Do not prefix the service role key with `NEXT_PUBLIC_` or commit `.env.local`.
3. Install the Supabase CLI using the official instructions, authenticate with `supabase login`, and link the project with `supabase link --project-ref <your-project-ref>`.
4. Apply the migrations with `supabase db push`. For a local Supabase stack, run `supabase start`, then `supabase db reset`.
5. Seed the platform account with `npm run seed:platform`. This command uses the service role key only on the server and is safe to re-run.
6. Start the app with `npm run dev` and open `http://localhost:3000`.

The migration files use timestamped Supabase CLI-compatible names. They were authored directly because the CLI was unavailable in the build environment, so review them and run `supabase db reset` against a disposable local project before applying them to a hosted project.

## Authentication model

The registration screen collects a full name, college, username, and password. Supabase Auth stores the password hash. The server creates a confirmed Auth user with an internal non-deliverable `.invalid` email derived from the unique username, then establishes the cookie session. A database trigger requires server-managed `app_metadata` for account creation, so the public client cannot bypass registration and mint student or AI roles with editable user metadata. College is profile information and is checked as an additional sign-in detail; it is not treated as proof of enrollment. Ordinary password login does not use OTP. Students can enroll a separate recovery email in Settings; an expiring, single-use verification code confirms it before that email can be used for password reset.

For production, configure Supabase Auth password-strength and abuse protections, keep all server secrets in the deployment environment, and configure a verified recovery email sender before opening registration broadly. Recovery uses the Resend email API; set a verified sender address, API key, and a random `RECOVERY_CODE_SECRET` with at least 32 characters. The application has a database-backed rate limiter for registration/login and social write endpoints; keep Supabase Auth's own sign-in rate limits enabled because clients can call Auth endpoints directly. Supabase access tokens are stateless and remain usable until expiry even after refresh-session revocation, so set a short, appropriate JWT lifetime in the project.

## Environment variables

See `.env.example`. AI configuration is optional. Supported AI settings are `AI_PROVIDER=openai`, `AI_API_KEY`, `AI_MODEL`, and optional `AI_BASE_URL`. The server calls the configured OpenAI-compatible Chat Completions endpoint; no AI key reaches the browser. Password recovery requires `RESEND_API_KEY`, a verified `RESEND_FROM_EMAIL`, and a random `RECOVERY_CODE_SECRET` of at least 32 characters. Recovery codes are HMAC-hashed in the database, single-use, and expire after ten minutes. See the [Resend email API](https://resend.com/features/email-api) for sender setup.

The app sends signed, best-effort new-student and onboarding events when `N8N_NEW_STUDENT_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` are configured. The goal-reminder and weekly-review environment slots are reserved but the corresponding scheduled workflows are not implemented. The core application does not depend on n8n.

## Checks

Run `npm run typecheck`, `npm run lint`, and `npm test` after installing dependencies. `lib/matching.test.ts` covers ranking and eligibility filters. This workspace could not download packages from the npm registry, so `package-lock.json` could not be generated. Dependency installation, TypeScript, lint, Vitest, Next build, Supabase migration application, and end-to-end auth/RLS checks have not been run here. Node syntax checks, a direct matching smoke check, internal import-path resolution, and migration filename/RLS coverage checks did pass.

## Deployment

Deploy the Next.js app to Vercel and add the same variables from `.env.example` in the project environment settings. Apply reviewed migrations to the linked Supabase project, run `npm run seed:platform` once (or again safely), set the production Supabase Auth site URL to the Vercel domain, and confirm storage buckets and RLS policies exist. Keep AI and service-role credentials in server-only Vercel environment variables. Verify the signup, private-account access, account deletion, and storage policies with separate test users before enabling public registration.
