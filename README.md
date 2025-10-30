AtlasKit — Global Map SaaS (Starter)
====================================

AtlasKit is a dark, modern SaaS starter. You get:

*   Marketing pages (Home, Features, Pricing)
*   An in-app Dashboard
*   A working global Map Builder powered by Leaflet + OpenStreetMap
*   Auth modal flow (Sign In / Start Free) wired to a fake session for now

This is designed so you can plug in a real backend (Node.js / Express / Stripe / MySQL) without redesigning the UI.

Leaflet OpenStreetMap No API Keys Embeddable Maps

* * *

1\. TL;DR
---------

*   Dark glass UI with radial gradient background and frosted nav bar (no Tailwind required).
*   Hash-based routing (`#home`, `#pricing`, `#map`, etc.).
*   **Map Builder**:
    *   Search any address worldwide (Nominatim + Photon lookup)
    *   Bias search to current map view or restrict results to the current bounds
    *   Drop a marker, edit popup text, choose basemap style, toggle scroll/drag behavior
    *   Generate embed code (full Leaflet snippet or minimal snippet)
    *   Download a standalone HTML map file
    *   Create a sharable link with the map config encoded in `?c=`
*   Dashboard mock shows KPIs, activity, and saved maps.
*   Auth modal mock simulates sign-in and sends you to the dashboard.

* * *

2\. App Structure
-----------------

The entire app runs from one HTML file. Navigation is done with URL hashes. When the hash changes (for example `#pricing`), the router:

*   Activates the matching `<section class="page" id="pricing">`
*   Highlights that item in the nav bar
*   Lazily initializes page-specific code (Map page, Dashboard page)

    <main>
      <section class="page" id="home">...</section>
      <section class="page" id="features">...</section>
      <section class="page" id="pricing">...</section>
      <section class="page" id="dashboard">...</section>
      <section class="page" id="map">...</section>
    </main>
    

Navbar links are ordinary anchors:

    <a href="#map" data-route>Map Builder</a>
    

This means it works on static hosting. No framework required.

* * *

3\. Pages / Views
-----------------

### 3.1 Home

The Home section is your hero / marketing splash:

*   Explains global geocoding and instant embeddable maps
*   No API keys needed
*   Primary calls to action: “Open Map Builder” and “See Pricing”

### 3.2 Features

Lists what exists now vs roadmap.

*   Current:
    *   Worldwide address search
    *   Bias to current view / restrict to bounds
    *   Leaflet basemap styles (OSM, Carto Light/Dark, Stamen Toner)
    *   Interactive marker with popup text
    *   No-iframe and minimal embed snippets
    *   Downloadable ready-to-use HTML
*   Roadmap:
    *   Workspaces and roles
    *   Saved maps and version history
    *   Team share links
    *   Usage analytics
    *   SSO / MFA

### 3.3 Pricing

There are three plans. You can hook these directly to Stripe Checkout.

Plan

Price

Highlights

**Starter**

$0/mo

Unlimited previews, copy embeds, download HTML, email support

**Pro**

$19/mo

Saved maps, custom styles, priority support

**Business**

$79/mo

Team workspaces, SSO/MFA, usage analytics

Each card has a button that calls `openSignup()`, which currently opens the auth modal. Later you’ll send that to real signup + Stripe.

### 3.4 Dashboard

This is the “app” side:

*   KPI cards: saved maps, total embeds copied, etc.
*   Recent activity list (“Copied embed for ‘Café Milano’”)
*   Saved maps panel with quick actions (Open / Share)

Right now data is mocked in JS:

*   `#activityList` is filled from a static array
*   `#mapsList` is populated by `addMockMap()`

In production:

*   Replace with calls to `/api/activity` and `/api/maps`
*   Populate KPI counts from real usage metrics per user / per team

### 3.5 Map Builder

This is the core feature. It’s already working.

*   Type any address and click **Search**
*   The app queries Nominatim and Photon, merges / dedupes results, and shows up to 5 options
*   Selecting a result:
    *   Pans/zooms the map
    *   Moves the Leaflet marker
    *   Updates the popup text
*   Configurable:
    *   Popup text
    *   Zoom level
    *   Basemap style (OSM, Carto, Stamen)
    *   Map height
    *   Marker draggable toggle
    *   Scroll-wheel zoom toggle
    *   Show / hide zoom controls
*   Output tools:
    *   **Generate Embed Code** → fills a code box
    *   **Copy No-Iframe Snippet** → full Leaflet setup (CSS+JS included)
    *   **Copy Minimal Snippet** → assumes Leaflet is already on page
    *   **Download as HTML** → creates a complete standalone HTML map file
    *   **Copy Share Link** → URL with encoded config in `?c=`

All of this matches the SaaS visual language: dark glass panels, subtle borders, rounded corners, pills, and high-contrast white inputs.

* * *

4\. Styling / Theme
-------------------

Theme variables (used throughout the UI):

    :root {
      --panel:#12172b;
      --muted:#8b92a7;
      --text:#e8ecf7;
      --border:rgba(255,255,255,.08);
      --bg-grad: radial-gradient(1200px 600px at 20% 0%, #101736, #0b1020 60%);
      --brand:#2a66ff;
      --brand-2:#2253cc;
    }
    

*   **Background:** radial dark blue/purple gradient
*   **Panels:** subtle glass effect, thin 1px border, soft box shadow
*   **Navbar:** sticky at top, translucent, blurred backdrop
*   **Pills:** tiny rounded spans used to badge “Leaflet”, “No API Keys”, etc.
*   **Buttons:**
    *   Primary (`.btn`): blue gradient from `--brand` to `--brand-2`
    *   Secondary (`.btn.secondary`): semi-transparent dark panel style
    *   Ghost (`.btn.ghost`): transparent outline for quiet actions
*   **Inputs:** white background, black text. That contrast matters on a dark UI, especially for clients entering addresses.

* * *

5\. Auth Flow (Demo)
--------------------

The header has “Sign in” and “Start free”. Both open an overlay modal with blur and dark backdrop. After “Continue”:

*   We pretend to authenticate
*   We close the modal
*   We route you to `#dashboard`

To make this real:

*   POST to `/api/auth/login` or `/api/auth/signup` (Node / Express)
*   Store JWT or session cookie
*   Hydrate dashboard from the logged-in user's data

* * *

6\. Turning This Into a Real SaaS
---------------------------------

### 6.1 Users

*   Create a `users` table in MySQL/Postgres:
    *   `id`
    *   `email`
    *   `password_hash`
    *   `plan` (starter / pro / business)
    *   `created_at`
*   On signup:
    *   Hash password (bcrypt/argon2)
    *   Create Stripe customer
    *   Default plan = starter
*   Return a signed JWT and store it locally or in an HttpOnly cookie

### 6.2 Maps

*   Create a `maps` table:
    *   `user_id`
    *   `lat`, `lng`, `zoom`
    *   `popup_text`
    *   `style`, `height_px`
    *   `created_at`
*   Add a “Save Map” button in the Map Builder that:
    *   Requires auth
    *   POSTs current config to `/api/maps`
    *   Shows it under “Saved maps” on the dashboard
*   “Copy Share Link” can eventually be a clean short slug instead of a giant `?c=` param

### 6.3 Activity / KPIs

*   Every time the user copies an embed, downloads HTML, or shares a link, send an event to `/api/activity`
*   Dashboard pulls the latest ~10 events
*   KPI cards just count totals (maps saved, embeds copied, etc.)

### 6.4 Billing

*   Wire the Pricing plan buttons to Stripe Checkout
*   Starter = free, Pro and Business = recurring subscription
*   Stripe webhooks update the user's `plan` in your DB

* * *

7\. Deployment
--------------

### Static Demo

*   You can deploy the single HTML file with no backend at all
*   GitHub Pages, Netlify, Vercel (static), S3 + CloudFront, nginx, etc.

### Full SaaS Stack

*   **Frontend:** this UI (can stay vanilla or migrate to React/Blazor)
*   **Backend:** Node.js + Express
    *   `/api/auth`
    *   `/api/maps`
    *   `/api/activity`
    *   Stripe webhooks
*   **DB:** MySQL or Postgres
*   **Billing:** Stripe Billing for Starter / Pro / Business tiers

* * *

8\. Credits / Licenses
----------------------

*   **OpenStreetMap contributors** for map data. Respect attribution and usage policies.
*   **Tile providers**:
    *   OpenStreetMap
    *   Carto (Positron / Dark Matter)
    *   Stamen (Toner)
*   **Geocoding**:
    
    *   Nominatim (OpenStreetMap)
    *   Photon (Komoot)
    
    Make sure to follow fair-use / rate limit expectations and send a proper `User-Agent` in production.
*   **Leaflet**: BSD-2-Clause License

* * *

© AtlasKit — dark SaaS starter UI. Ready to plug into Node + Stripe + MySQL.