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

Changes made in the admin portal must automatically update SponsorHome.

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
