# RedLine — Frontend

A production-quality frontend for an emergency blood/plasma matching app, built for your Express + PostgreSQL backend.

## Getting started

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:4000` (see `vite.config.js`) — point that at wherever your Express server runs, or edit the target.

## Design system

- **Palette**: `ink` (near-black navy surfaces), `paper` (warm off-white background), `pulse` (crimson — emergency/primary), `plasma` (amber — pending), `vital` (green — fulfilled/available). Defined as Tailwind tokens in `tailwind.config.js`.
- **Type**: Fraunces (display/headlines), Inter (UI/body), IBM Plex Mono (all numeric data — distances, unit counts, tokens, timers) — loaded via Google Fonts in `index.html`.
- **Signature motif**: `src/components/PulseLine.jsx`, a live ECG waveform used as the loading treatment, an ambient "system is live" indicator under the nav, and a one-shot animation on successful donation verification.

## Folder structure

```
src/
  components/
    ui/          Design-system primitives (Button, Card, Input, Badge, Modal, Toast, Skeleton)
    layout/       Navbar, AppShell (desktop nav + mobile bottom nav)
    PulseLine.jsx Signature waveform component
  pages/          One file per route/screen
  context/        AuthContext — session state, token storage
  hooks/          useGeolocation — explicit-consent location capture
  lib/api.js      Single API client — every backend call goes through this file
```

## Backend contract (endpoints this frontend expects)

All routes are called relative to `/api`. Adjust `src/lib/api.js` to match your actual Express routes/response shapes — this is the only file that needs to change if your API differs.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | `{ email, password }` → `{ token, user }` |
| POST | `/auth/register` | `{ name, email, password, bloodGroup, city }` → `{ token, user }` |
| POST | `/auth/logout` | Invalidate session |
| POST | `/donors/location-sync` | `{ lat, lng }` — update PostGIS location |
| PATCH | `/donors/availability` | `{ isAvailable }` |
| GET | `/donors/me` | Donor profile + history for the profile page |
| GET | `/requests/nearby?lat&lng` | `{ results: [...] }` sorted by distance for the live feed |
| GET | `/requests/mine` | `{ results: [...] }` for the requester dashboard |
| GET | `/requests/:id` | Single request detail (used by QR/scanner screen) |
| POST | `/requests` | Create a new emergency request, returns the created record incl. `secureToken` |
| PATCH | `/requests/:id/cancel` | Cancel an active request |
| POST | `/requests/verify` | `{ secureToken }` — marks a unit fulfilled |
| POST | `/requests/:id/verification` | multipart upload for the verification slip |

## Notable UX decisions

- **Geolocation is opt-in and visible**, not fired silently after login — a dismissible prompt on the feed and new-request form triggers `navigator.geolocation` only on explicit tap. This is both a trust and App Store/browser-permissions consideration for a public safety app.
- **Skeleton loaders use the pulse-line motif** instead of generic gray shimmer, so even the waiting states carry the product's identity.
- **Toast + confirm-dialog patterns** are centralized (`ToastProvider`, `ConfirmDialog`) so any future screen gets consistent feedback for free.
- **Mobile**: bottom tab bar replaces the top nav's links under `sm` breakpoint; all screens tested down to 360px width.

## Extending

- Swap `Field/Input/Select/Textarea` in `components/ui/Input.jsx` for shadcn/ui equivalents if you want Radix-backed accessibility primitives underneath — the visual layer (Tailwind classes) is already isolated there.
- Real QR scanning (camera) isn't wired up — `ScannerPanel` in `EmergencyDetail.jsx` has a placeholder viewfinder and manual token entry; drop in a library like `react-qr-reader` or `html5-qrcode` and call `api.verifyFulfillment` with the scanned value.
