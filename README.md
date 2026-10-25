# ClubHub Smart Event Management

ClubHub is a browser-based college event and club management application. Students can discover campus events and clubs, organizers can run events and track attendance, and administrators can oversee clubs and events. The interface is a React single-page application built with TypeScript and Vite.

## Contents

- [What the application does](#what-the-application-does)
- [Technology](#technology)
- [Run locally](#run-locally)
- [Demo accounts](#demo-accounts)
- [How the application starts](#how-the-application-starts)
- [Features by role](#features-by-role)
- [Data and synchronization](#data-and-synchronization)
- [Authentication and integrations](#authentication-and-integrations)
- [Project layout](#project-layout)
- [Limitations and implementation notes](#limitations-and-implementation-notes)

## What the application does

ClubHub brings campus clubs, events, registration, attendance, and post-event feedback into one interface. The public home page introduces the service. After signing in, the role saved on the account selects one of three dashboards:

- **Student:** browse events, register, manage registrations, explore clubs, see events in a calendar, view a personal event QR code, and submit event feedback.
- **Organizer:** create and manage events, scan student QR codes for check-in, view and export registrants, and create/manage feedback forms for events.
- **Administrator:** view platform summaries and manage clubs and events.

The interface also has a light/dark theme toggle and uses responsive components from Radix UI and the local `src/components/ui` library.

## Technology

- React 18 and TypeScript
- Vite 6 for development and production builds
- Tailwind CSS and shared CSS in `src/index.css` and `src/styles/globals.css`
- Radix UI primitives, Lucide icons, Recharts, and Sonner notifications
- Supabase Auth and Supabase Edge Function APIs for authentication and shared application data
- Browser `localStorage` for cached app data and the locally restored session
- QR code rendering/reading with `qrcode.react` and `jsqr`
- Google Calendar REST API integration for adding events to a signed-in user's calendar

## Run locally

Use Node.js and npm from the project directory:

```bash
npm install
npm run dev
```

Vite prints the address it is serving, normally `http://localhost:5173`. To use port 3000:

```bash
npm run dev -- --port 3000
```

The Vite development server supports hot reload while you edit source files. To create a production build, run:

```bash
npm run build
```

The project does not define a test script. The development app uses a Vite React/SWC plugin; if Vite reports that SWC's native binding cannot load, reinstall dependencies with `npm install` and run the server from a normal local terminal where Node can access its native module/cache.

## Demo accounts

The login page includes built-in demo accounts. Demo login is handled in the browser by `src/components/AuthContext.tsx`; it does not require a Supabase account.

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Student | `demo@student.com` | `demo` | Student dashboard |
| Organizer | `tech@clubhub.com` | `tech123` | Tech Innovators Club |
| Organizer | `design@clubhub.com` | `design123` | Design & Art Society |
| Organizer | `sports@clubhub.com` | `sports123` | Sports & Fitness Club |
| Organizer | `music@clubhub.com` | `music123` | Music & Arts Club |
| Organizer (legacy demo) | `demo@organizer.com` | `demo` | Organizer without a linked demo club |
| Admin | `admin@thapar.edu` | `thapar123` | Administrator dashboard |

These credentials are for demonstration only. They are hard-coded in client-side code and are not suitable for a production system. The organizer login is associated with its club ID and name, so the dashboard can identify the organizer's club.

## How the application starts

1. `src/main.tsx` creates the React root, imports the global stylesheet, and renders `App`.
2. `src/App.tsx` wraps the app in the theme and authentication providers and mounts the notification toaster.
3. On startup, the app initializes demo clubs/organizers in `localStorage` once and starts data synchronization with Supabase.
4. `AuthProvider` restores a locally saved non-Google user, checks for a Supabase Auth session, and listens for sign-in/sign-out changes.
5. While authentication initializes, the app shows a loading state. Signed-out visitors see the home page or login form. Signed-in users see the dashboard matching their `student`, `organizer`, or `admin` role.

The theme is managed by `next-themes` through `src/components/ThemeProvider.tsx`, with the browser storage key `clubhub-theme`. The navigation bar displays the signed-in user's name and role, allows sign-out, and toggles the theme.

## Features by role

### Student

- **Events:** browse available events, inspect details, and register. Registration is tracked per student and duplicate registrations are prevented by the storage helper.
- **My Events:** see registrations and unregister.
- **Clubs:** browse the club directory, join or leave clubs, and see membership counts.
- **Calendar:** view event dates in a calendar-oriented screen.
- **QR Code:** access a QR code associated with the student's event registration identity for check-in.
- **Feedback:** submit answers to an organizer's active event feedback form.
- **Google Calendar:** when signed in through Google OAuth with the required calendar scope, add event details to the primary Google Calendar.

### Organizer

- **Events:** create and delete events and open event details. Events include fields such as title, date/time, location, capacity, category, description, image, and team members.
- **QR Scanner:** scan a participant's code and mark a matching registration as checked in. Browser camera permission is needed for camera scanning.
- **Students:** review event registrants and export the displayed list.
- **Feedback:** create event feedback questionnaires and view responses/statistics.

### Administrator

- **Overview:** see high-level club/event/engagement summaries.
- **Clubs:** create, review, and delete clubs.
- **Events:** inspect and manage events across clubs.

Role selection controls which dashboard is rendered in the UI. It is not, by itself, a complete server-side authorization boundary; see the notes below.

## Data and synchronization

The frontend uses helper modules in `src/utils` to read and write data. Most screens access data synchronously from `localStorage` so they can render immediately. Writes are stored locally first, then the helper makes a best-effort request to the Supabase Edge Function API. A failed remote request is logged to the browser console; local UI state may still have changed.

At startup, and then every 30 seconds, `src/utils/syncData.tsx` requests events, registrations, clubs, memberships, and organizers from the configured Supabase function and refreshes local cache keys. The app does not implement a queued offline-write/reconciliation system; a later remote refresh can replace some cached data. Feedback uses its own Supabase function calls rather than the central 30-second synchronization.

Common browser storage keys include:

| Key | Purpose |
| --- | --- |
| `clubhub-user` | Locally restored user/session details |
| `clubhub-google-role` | Role to apply after Google OAuth returns |
| `clubhub-demo-initialized` | Prevents demo data from being initialized repeatedly |
| `clubhub-clubs` | Demo club seed data |
| `clubhub-organizers` | Demo organizer records and synced organizer list |
| `clubhub-all-events` / `eventsData` | Event cache and legacy event data key |
| `clubhub-registrations` | Registration and check-in cache |
| `clubs` / `clubMemberships` | Club directory and membership cache |

Clearing the browser's site data removes this local cache and local demo state. Demo clubs are initialized again on the next page load. Supabase-backed data may be fetched again if the backend is available.

## Authentication and integrations

### Supabase

`src/utils/supabase/info.tsx` contains the Supabase project ID and public anonymous key used by the browser client and API helpers. The frontend calls a Supabase Edge Function under the `make-server-94da7951` path. Its deployable Hono server is in `supabase/functions/make-server-94da7951` and exposes:

- `/health` for a simple health response
- `/auth/signup` and `/auth/create-organizer` for user creation
- `/data/events`, `/data/registrations`, `/data/clubs`, `/data/memberships`, and `/data/organizers` for app data
- `/feedback/forms` and `/feedback/responses` routes for feedback forms and submissions

The server uses Supabase Auth and a key-value store helper. Deploying these routes requires the Supabase project and its server-side environment secrets, including the service-role key, to be configured in the Edge Function environment. The service-role key must never be put in client code. The anonymous key is intended for public client access; access policy and server-side validation still need to protect sensitive operations.

To deploy the Edge Function, install and authenticate the Supabase CLI, then run these commands from the repository root:

```bash
supabase login
supabase link --project-ref oecogsvqzjliycaxekwx
supabase functions deploy make-server-94da7951
```

The deployable function lives in `supabase/functions/make-server-94da7951`. After deployment, send a GET request with the project's anon key in the `Authorization: Bearer <anon-key>` header to `https://oecogsvqzjliycaxekwx.supabase.co/functions/v1/make-server-94da7951/health`; it should return `{"status":"ok"}`. The function name is included once in the public URL and matches the Hono route prefix. Vercel deploys only the Vite frontend, so deploy the Supabase function separately after changes to it. Configure required secrets in Supabase Edge Function settings; never add the service-role key to Vercel's client-side `VITE_*` variables.

### Google OAuth and Calendar

The Google login action uses Supabase OAuth and requests the `calendar.events` scope. The role chosen on the login screen is saved before redirect and applied after the OAuth callback. Calendar event creation calls Google's Calendar API with the returned access token. The project must have Google as a configured Supabase identity provider and the appropriate OAuth consent, redirect, and Calendar API settings.

The current calendar delete helper is a placeholder and does not delete an event from Google Calendar. The UI should be treated accordingly.

## Project layout

```text
src/
  App.tsx                       App startup, providers, auth routing, data initialization
  main.tsx                      React entry point
  components/
    AuthContext.tsx              Login, signup, OAuth, session restoration, logout
    HomePage.tsx                 Public landing page
    LoginPage.tsx                Login/signup and demo account UI
    Navbar.tsx                   User menu and theme switch
    StudentDashboard.tsx         Student dashboard tabs
    OrganizerDashboard.tsx       Organizer dashboard tabs
    AdminDashboard.tsx           Admin dashboard tabs
    student/                     Student event, club, calendar, QR, and feedback screens
    organizer/                   Organizer event, scanning, roster, and feedback screens
    admin/                       Admin overview, event and club management
    ui/                          Shared UI primitives
  utils/
    demoData.tsx                 Demo clubs and organizer credentials
    *Storage.tsx                 Browser data stores and best-effort sync calls
    supabaseData.tsx              Supabase Edge Function API client
    syncData.tsx                 Initial and periodic remote data refresh
    googleCalendar.tsx           Google Calendar API helpers
    supabase/                    Supabase client and project configuration
  supabase/functions/server/     Hono/Deno Edge Function API implementation
  styles/globals.css             Global theme and component styles
```

Other project files:

- `index.html` is the HTML shell Vite serves.
- `vite.config.ts` configures Vite and the React/SWC plugin.
- `src/Attributions.md` records design/resource attributions.
- `src/DEMO_ACCOUNTS_TEST.md` provides a more detailed demo-account walkthrough.

## Limitations and implementation notes

- Demo accounts and demo passwords are client-side examples and provide no real security.
- The app has a configured Supabase project identifier and public key. Running the frontend does not itself deploy or configure the backend Edge Functions.
- Most data helpers optimistically update browser storage and send remote requests without waiting for confirmation. Check the browser console and the Supabase function logs when remote data does not appear.
- Some club/event data is seeded in the browser, while remote synchronization can populate or replace caches. A fresh browser and an already-used browser may therefore display different data.
- Some screens use older storage conventions alongside the shared storage helpers. For example, dashboard counts and event views may read different local keys. If a count looks stale, inspect the relevant component and browser storage key.
- Google Calendar deletion is not implemented; calendar integration requires OAuth/provider configuration and a valid access token.
- The home page includes external Unsplash images and an embedded YouTube video, so those visuals depend on network access.
- The included API code and UI demonstrate a workflow, but production use requires reviewing authentication, authorization, data validation, rate limiting, privacy, and server-side access controls.
