# Media Brite Smile

Website for Media Brite Smile, a family, cosmetic and implant dental practice at 8 N Pennell Rd, Media, PA.

Built with Next.js 16 (App Router, Cache Components), Tailwind CSS v4, GSAP, Lenis and Motion.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier (with Tailwind class sorting) |

## Where things live

- `src/app/`: routes (home, `about-us/[doctor]`, `locations`, `locations/[slug]`, `privacy-policy`, `terms-of-use`, `disclaimer`, 404)
- `src/content/`: all copy and data. `site.ts` (practice details, services, locations, FAQs), `doctors.ts` (doctor profiles), `legal.ts` (legal pages)
- `src/components/`: `layout/` (header, footer, menus, floating buttons), `sections/` (home page sections), `doctor/`, `location/`, `legal/`, `motion/` (animation wrappers), `ui/` (shared pieces)
- `src/lib/`: GSAP setup, motion presets, utilities
- `public/images`, `public/videos`: photos and the office tour video

## Appointment form email (SMTP)

The appointment request form (on `/patient-information/scheduling` and `/contact-us`) is emailed to the practice through SMTP.

1. Copy `.env.example` to `.env.local` and fill in the SMTP settings (local testing).
2. Add the same variables in Vercel under Project > Settings > Environment Variables (live site), then redeploy.
3. Send a test request from the live site and confirm it arrives.

Until every required variable is set, the form still validates but tells visitors that online requests are not switched on yet and to call.

- Validation rules: `src/lib/appointment-request.ts`, shared by the browser and the server
- Server action: `src/lib/appointment-action.ts` (spam trap, timing check, rate limit of 5 requests per IP every 15 minutes)
- Email: `src/lib/mailer.ts` (TLS 1.2+ required; no patient details in the subject line)

HIPAA: appointment requests are protected health information. Use a mailbox whose provider has signed a Business Associate Agreement with the practice (for example Google Workspace or Microsoft 365 with a BAA).

## Content rules

- Facts only: every claim, bio and review comes from the practice's current website or its published details.
- The Privacy Policy, Terms of Use and Disclaimer are plain-language drafts and must be reviewed by the practice before launch.
