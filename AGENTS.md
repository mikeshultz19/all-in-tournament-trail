# All-In Tournament Trail

- Project: All-In Tournament Trail
- Framework: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- Design: black/charcoal background, red headings, gold accents
- Style: premium outdoor sports, clean, simple, minimal, typography-driven
- Avoid clutter and excessive cards.
- Reuse existing components before creating new ones.
- Do not invent routes or pages without approval.
- Prefer complete, maintainable solutions over experimental placeholders.
- Keep architecture simple because one administrator will maintain the site.
- Verify lint, TypeScript, and build after meaningful changes.
- Never delete files without first proving they are unused.
- Follow the approved master sitemap in `docs/MasterSiteMap.md`.

==================================================
CURRENT ARCHITECTURE — VERIFIED 2026-07-23
==================================================

- Public domain: `allintrail.com`
- Canonical future production URL: `https://allintrail.com`
- Admin application: AITT Admin Center
- Backend: Supabase PostgreSQL
- Prisma is not used.
- Planned production hosting: Vercel; production deployment is not verified.
- DNS and inbound email routing: Cloudflare
- Public contact address: `info@allintrail.com`

The Contact page and floating Contact widget use `mailto:` links to open the
visitor's configured email application. Cloudflare Email Routing forwards
inbound mail to the verified Gmail destination; it is not an application
email-sending API. There is no server-side contact submission endpoint.

Resend has been removed. Do not recreate `app/api/feedback`, add Resend, or add
contact-email environment variables without explicit approval.

AITT Admin Center reads live Tournament Information from Supabase, updates it
successfully, and preserves saved values after refresh. Describe this as the
verified Tournament Information read/update workflow, not full CRUD. Tournament
creation and deletion are not verified.

Anonymous `SELECT` and `UPDATE` table privileges currently support development.
Anonymous `UPDATE` is temporary and must be replaced with authenticated Admin
policies before production. Supabase Auth, Storage, News & Announcements,
Tournament Conditions, Tournament Results, WeighFish import, and winner-photo
uploads are not complete.

==================================================
NEXT IMPLEMENTATION ORDER
==================================================

2. News & Announcements
3. Tournament Conditions
4. Tournament Results
5. Authentication and Production Security

See `docs/ProjectStatus.md` and `docs/DevelopmentRoadmap.md` for the full,
ordered work plan. Do not add Sponsors to the four tournament management areas
or Website Readiness workflow.

==================================================
HOMEPAGE SPONSOR PANEL
==================================================

Do not stretch or shrink the Tournament Conditions or Featured Tournament
content merely to eliminate empty space.

Create a reusable homepage sponsor component named:

components/SponsorHome.tsx

Place SponsorHome directly beneath the Tournament Conditions panel in the
left homepage column.

The left column should contain:

1. Tournament Conditions
2. SponsorHome

The combined height should visually align with the bottom of the Featured
Tournament panel in the right column when sufficient sponsor content exists.

Do not use fixed pixel heights to force alignment. Use the existing homepage
grid/flex layout so both columns stretch naturally.

SponsorHome should display the heading:

MAJOR SPONSORS

Display active sponsor logos in a responsive grid.

Desktop:
- 2 or 3 sponsor logos per row

Tablet:
- 2 logos per row

Mobile:
- 1 or 2 logos per row depending on available width

Each sponsor may contain:

- name
- logo image
- website URL
- active status
- show on homepage status
- major sponsor status
- display order

Only render sponsors where:

- active is true
- showOnHomepage is true
- majorSponsor is true

Sort by display order.

Sponsor logos must:

- preserve their original aspect ratio
- use object-fit: contain
- not be cropped
- have descriptive alt text
- open the sponsor website safely when a URL exists
- use rel="noopener noreferrer" for external links

Use a subtle default opacity or grayscale treatment if it fits the existing
site design, with a restrained brightness or color transition on hover.

Do not use an automatic carousel.

If no qualifying sponsors exist, do not render an empty bordered panel.

==================================================
ADMIN SPONSOR MANAGEMENT
==================================================

Inspect the existing sponsor data model and admin interface.

Reuse existing sponsor fields where available.

Add only missing fields needed for:

- active
- showOnHomepage
- majorSponsor
- displayOrder
- logo
- websiteUrl

Allow administrators to:

- upload or select a sponsor logo
- enter the sponsor name
- enter the sponsor website URL
- mark a sponsor active or inactive
- mark a sponsor as a major sponsor
- choose whether it appears on the homepage
- set its display order

Future sponsor administration must remain separate from tournament readiness.
If sponsor editing is implemented later, published changes must update
SponsorHome without adding Sponsors to the four-card tournament dashboard.

Do not hard-code sponsor names, images, or links into the homepage component.

==================================================
HOMEPAGE LAYOUT
==================================================

Update the homepage desktop layout so:

LEFT COLUMN
- Tournament Conditions
- SponsorHome

RIGHT COLUMN
- Featured Tournament
- Tournament Information
- Early Registration Status

The bottom of SponsorHome should approximately align with the bottom of the
right-side Featured Tournament content through natural grid stretching.

On mobile, stack the sections in this order:

1. Featured Tournament
2. Tournament Information
3. Tournament Conditions
4. Early Registration Status
5. Major Sponsors

Ensure the Contact tab does not overlap sponsor logos or content.
