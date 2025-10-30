# AtlasKit — Global Map SaaS (Starter)

# ====================================

# 

# AtlasKit is a single-page dark SaaS UI that already feels like a full product: pricing page, dashboard, auth modal, and a production-grade Leaflet map builder with global geocoding and embeddable outputs.

# 

# This repo is meant as a starting point for a hosted mapping platform: Leaflet OpenStreetMap No API Keys Copy-paste embeds

# 

# \*\*TL;DR\*\*

# 

# \*   Dark glass UI with radial background and frosted nav (no Tailwind / no framework needed).

# \*   Hash-based routing (`#home`, `#pricing`, `#map`, etc.).

# \*   “Map Builder” lets you search any address worldwide, drop a marker, customize zoom / style / behavior, then:

# &nbsp;   \*   Copy a Leaflet snippet

# &nbsp;   \*   Copy a minimal embed

# &nbsp;   \*   Download a full standalone HTML file

# \*   Dashboard page mock: KPIs, activity feed, saved maps.

# \*   Auth modal mock: sign in / sign up (ready to hook to real backend or Stripe signup).

# 

# 1\\. App Structure

# -----------------

# 

# Everything runs from a single HTML file using hash routing. When the hash changes (for example `#pricing`), the router:

# 

# \*   Activates the matching `<section class="page" id="pricing">…`

# \*   Highlights that nav link

# \*   Lazily initializes map code and dashboard code only when those pages are opened

# 

# &nbsp;   <main>

# &nbsp;     <section class="page" id="home">...</section>

# &nbsp;     <section class="page" id="features">...</section>

# &nbsp;     <section class="page" id="pricing">...</section>

# &nbsp;     <section class="page" id="dashboard">...</section>

# &nbsp;     <section class="page" id="map">...</section>

# &nbsp;   </main>

# &nbsp;   

# 

# Navbar links are normal anchors: `<a href="#map" data-route>Map Builder</a>`. No external router dependency.

# 

# 2\\. Pages / Views

# -----------------

# 

# \### 2.1 Home

# 

# Hero section explaining the product: global geocoding, no API keys, instant embeddable maps. Also has CTA buttons: `Open Map Builder` and `See Pricing`.

# 

# \### 2.2 Features

# 

# Bullet list of current abilities (search, draggable marker, basemap styles) and roadmap items (teams, saved maps, analytics, SSO/MFA). This becomes your marketing “Why us / Why now” section.

# 

# \### 2.3 Pricing

# 

# Three plans:

# 

# \*\*Starter — $0/mo\*\*

# 

# \*   Unlimited previews

# \*   Copy embed \& download

# \*   Email support (basic)

# 

# \*\*Pro — $19/mo\*\*

# 

# \*   Saved maps \& share links

# \*   Custom styles

# \*   Priority support

# 

# \*\*Business — $79/mo\*\*

# 

# \*   Team workspaces \& roles

# \*   SSO / MFA

# \*   Usage analytics

# 

# Each pricing card has a button wired to `openSignup()`, which triggers the auth modal and simulates onboarding. You’ll wire that to Stripe Checkout or your own signup route.

# 

# \### 2.4 Dashboard

# 

# Internal / “app” feel. Shows:

# 

# \*   KPI cards: saved maps, embeds copied, etc.

# \*   Recent activity (list of actions like “Copied embed for 'Café Milano'”).

# \*   Saved maps gallery with quick actions (open / share).

# 

# You’ll later replace:

# 

# \*   `#kpiSaved`, `#kpiEmbeds`, etc. with live data from your DB.

# \*   `#activityList` and `#mapsList` with a fetch to your API (`/api/activity`, `/api/maps`).

# 

# \### 2.5 Map Builder

# 

# This is the core product from the beginning. You already built it. We just dropped it into the SaaS shell without changing behavior:

# 

# \*   Type an address, click Search.

# \*   We query both Nominatim and Photon (OpenStreetMap ecosystem geocoders), merge results, dedupe, and give you up to 5 matches.

# \*   Choose a result in the dropdown to move the marker and recenter the map.

# \*   Configure:

# &nbsp;   \*   Popup text

# &nbsp;   \*   Zoom

# &nbsp;   \*   Basemap style (OSM, Carto Light/Dark, Stamen Toner)

# &nbsp;   \*   Embed height

# &nbsp;   \*   Options like draggable marker, scroll wheel zoom, show controls

# \*   Click \*\*Generate Embed Code\*\* and copy either:

# &nbsp;   \*   \*\*No-Iframe Snippet\*\* — a full Leaflet setup including CSS/JS tags

# &nbsp;   \*   \*\*Minimal Snippet\*\* — assumes Leaflet is already on the page

# \*   \*\*Download as HTML\*\* creates a complete self-contained HTML file with Leaflet and your marker/location baked in.

# \*   \*\*Copy Share Link\*\* encodes the map config (lat/lng/zoom/etc.) in a `?c=...` query param so you can send someone a “frozen” view.

# 

# The look matches the rest of the SaaS: rounded glass panels, light text on dark gradient, subtle borders, and pill labels.

# 

# 3\\. Styling / Visual Language

# -----------------------------

# 

# Core theme values are defined in `:root`:

# 

# &nbsp;   :root {

# &nbsp;     --panel:#12172b;

# &nbsp;     --muted:#8b92a7;

# &nbsp;     --text:#e8ecf7;

# &nbsp;     --border:rgba(255,255,255,.08);

# &nbsp;     --bg-grad: radial-gradient(1200px 600px at 20% 0%, #101736, #0b1020 60%);

# &nbsp;     --brand:#2a66ff;

# &nbsp;     --brand-2:#2253cc;

# &nbsp;   }

# 

# \*   \*\*Background\*\*: radial dark blue/purple gradient.

# \*   \*\*Panels\*\*: subtle glass cards with a soft linear gradient and thin 1px border in `rgba(255,255,255,.08)`.

# \*   \*\*Navbar\*\*: sticky, translucent (`backdrop-filter: blur(10px)`) with a faint bottom border.

# \*   \*\*Pills\*\*: rounded, 1px border, tiny all-capsish vibe for “Leaflet + OSM”, “No API Keys”, etc.

# \*   \*\*Buttons\*\*:

# &nbsp;   \*   Primary `.btn`: blue vertical gradient `var(--brand) → var(--brand-2)`.

# &nbsp;   \*   Secondary `.btn.secondary`: semi-transparent panel-style button.

# &nbsp;   \*   Ghost `.btn.ghost`: transparent dark outline, for quiet actions.

# \*   \*\*Inputs\*\*: white background / black text on top of the dark UI to maximize contrast and usability. This matters for real clients.

# 

# 4\\. Auth Modal (Demo)

# ---------------------

# 

# The header has “Sign in” and “Start free”. Both open a modal that overlays the app using blur + dark overlay. After “Continue” it just fakes auth and routes to `#dashboard`.

# 

# You’ll eventually replace `fakeAuth()` with:

# 

# \*   POST `/api/auth/login` / `/api/auth/signup` (Node, Express, etc.)

# \*   Store JWT or session cookie

# \*   Pull user data to populate dashboard KPIs and saved maps

# 

# 5\\. Data / Persistence Plan

# ---------------------------

# 

# Out of the box, everything is in-memory / mocked. Below is how you’d graduate it into a real SaaS:

# 

# \### 5.1 Users

# 

# \*   Create a `users` table in MySQL/Postgres (id, email, password\\\_hash, plan, created\\\_at).

# \*   On signup: hash password (bcrypt/argon2), create Stripe customer (if using Stripe), default plan = starter.

# \*   Return a signed JWT; store it in `localStorage` or HttpOnly cookie depending on your security model.

# 

# \### 5.2 Maps

# 

# \*   Create a `maps` table with: `user\_id`, `lat`, `lng`, `zoom`, `popup\_text`, `style`, `height\_px`, `created\_at`.

# \*   When user clicks “Save”, POST to `/api/maps` and insert a row.

# \*   Dashboard `#mapsList` GETs that list and renders the cards.

# \*   “Share link” can just be an encoded config now, or later a short slug pointing to a map in your DB.

# 

# \### 5.3 Activity Feed / KPIs

# 

# \*   Every time someone copies an embed, downloads HTML, or generates a share link, send an event to `/api/activity`.

# \*   Dashboard pulls last N events and aggregates totals.

# 

# 6\\. Deployment

# --------------

# 

# Minimal version (static demo) can be dropped on any static host (Vercel static, Netlify, S3 + CloudFront, nginx, etc.).

# 

# Full SaaS version typically becomes:

# 

# \*   Frontend: this UI (could stay mostly vanilla or be ported to React / Blazor / etc.).

# \*   Backend: Node.js + Express (auth routes, /api/maps, /api/activity, Stripe webhooks).

# \*   DB: MySQL or Postgres for users/maps/activity.

# \*   Billing: Stripe Checkout + Billing for recurring Starter / Pro / Business plans.

# 

# 7\\. TODO / Next Steps

# ---------------------

# 

# \*   \*\*Save Map\*\* button in the Map Builder panel that:

# &nbsp;   \*   Requires auth

# &nbsp;   \*   Sends current config to `/api/maps`

# &nbsp;   \*   Updates dashboard instantly

# \*   “Invite teammate” modal on Dashboard (collect email → POST /api/invite).

# \*   Usage limits per plan (Starter = manual copy only, Pro = can save maps, Business = teams, audit trail, etc.).

# \*   Legal pages (`#privacy`, `#terms`) turned into real routes or separate static pages.

# \*   Hardening geocoding: show rate limit info / polite usage message (Nominatim asks for fair usage and user agent). You should add a custom `User-Agent` + contact email header in production.

# 

# 8\\. Credits / Licenses

# ----------------------

# 

# \*   Maps and tiles: OpenStreetMap contributors (OSM). Tiles from OSM, Carto, Stamen. Respect their usage policies and attribution.

# \*   Geocoding: Nominatim (OpenStreetMap), Photon (Komoot). Follow their terms and fair use guidelines.

# \*   Leaflet: BSD-2-Clause License.

# 

# AtlasKit — dark SaaS starter UI  

# Ready to plug into Node + Stripe + MySQL

