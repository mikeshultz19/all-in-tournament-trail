# Tournament Operations and Registration Process

> Early Online Registration screen flow, lifecycle, pricing snapshot, Square
> handoff, and recovery behavior are defined in
> [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md). This
> document remains authoritative for tournament and Tournament Director rules.

## 1. Purpose

This document defines the official registration, tournament-morning, weather,
public-information, and Tournament Director workflows for All-In Tournament
Trail. Application behavior should follow this document unless these
requirements are later amended.

## 2. Registration Types

The site supports:

- Solo registration
- Team registration

For Team registration, information is collected independently for Angler 1
and Angler 2. Each angler provides:

- First name
- Last name
- Email address
- Mobile phone
- Street address
- City
- State
- ZIP Code
- Membership selection

Full addresses are required for tax and payout records. Private contact and
address information must not be displayed publicly.

## 3. Membership

Membership costs **$40 per angler annually** and is determined independently
for each angler. Membership choices are:

- Current member
- Purchase membership
- Continue as a non-member

For a team to receive member benefits, both registered anglers must be
members. Member benefits include access to:

- Bronze
- Silver
- Gold
- Insurance Pot
- AOY points
- Championship eligibility

When either team member is a non-member, member-only benefits must be
unavailable.

## 4. Entry Options and Payout Pots

Entry options include:

- Tournament Entry
- Big Bass
- Bronze
- Silver
- Gold
- Insurance Pot

**Tournament Entry** is required for every solo and team registration and includes
the Main payout. There is no participation-only tournament entry.

**Big Bass** is optional and is not a standalone tournament entry.

**Bronze, Silver, and Gold** are members-only, mutually exclusive selections.
Each pays 1 in 5.

**Insurance Pot** costs **$20**, requires Tournament Entry, and is members-only. It
pays the first entry out of the money from the Tournament Entry Pot and continues in
finishing order until available Insurance Pot money is exhausted.

The official results and payout workflow must support:

- Base payout
- Bronze payout
- Silver payout
- Gold payout
- Two Big Bass payouts

## 5. Early Online Registration

Early online registration is a normal registration option. It closes at
**9:00 PM local tournament time on the evening before the tournament**. All
tournament deadlines use the `America/Chicago` time zone, including automatic
daylight-saving adjustments.

Registrations submitted during this period are classified as
`early_online`. Each submission must receive a server-generated timestamp that
does not depend on the angler's browser clock.

The website stores these registrations only after successful Square card
payment. Credit or debit card payment is required, cash is unavailable online,
and a 3% Card Processing Fee applies to the card-payment subtotal. Tournament
officials use the confirmed registrations as part of the pre-tournament
WeighFish workflow.

## 6. Tournament-Morning Registration

Tournament-Morning Registration is a normal walk-up registration option and
must not be described as late registration. It is conducted by the Tournament
Director at the registration table in WeighFish, not through the AITT website.

The Tournament Director enters the team or individual in WeighFish and records
Cash or Card. Cash has no processing fee. Card payments are processed
separately through the Square reader and include the same 3% Card Processing
Fee used online. A paper form is maintained only as emergency operational
backup.

AITT does not operate a morning point-of-sale screen, duplicate the WeighFish
roster or cash-versus-card record, maintain a live morning Square ledger, or
synchronize these systems in real time.

## 7. Registration Record Requirements

Every online registration must store enough information to identify:

- Tournament
- Solo or Team registration
- Angler information
- Angler 2 information for Team registration
- Membership selections
- Entry selections
- Selected payout pots
- Itemized charges
- Card-payment subtotal, Card Processing Fee, and total charged for Early
  Online Registration
- Minimum Square payment reference and payment status for Early Online
  Registration
- Registration period
- Server-generated submission timestamp

Suggested `registrationPeriod` values:

- `early_online`

Suggested `paymentStatus` values:

- `pending`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`, if later needed

These website payment fields apply to Early Online Registration only.
Tournament-morning payment method remains owned by WeighFish, while Square
remains authoritative for the associated card-reader transaction.

## 8. Tournament Director Admin Portal

The Tournament Director must log in to a protected Admin Portal. Public users
must not have access to administrative controls or private registration
details.

The Admin Portal must allow the Tournament Director to:

- Select a tournament
- View all online registrations
- Filter Early Online registrations
- See submission timestamps
- See selected entry and payout pots
- See Early Online Registration payment status
- Export registration information if needed
- Update tournament status
- Publish the current weather or tournament announcement
- Delay, postpone, cancel, or reschedule a tournament
- Override estimated safe light when necessary

## WeighFish Workflow

AITT stores confirmed Early Online Registrations. WeighFish owns the
tournament-day roster, Tournament-Morning Registration, check-in, weigh-in,
scoring, official results, and official CSV export.

### Night Before

- Retrieve confirmed Early Online Registrations
- Enter or import those anglers into WeighFish using the supported operational
  process

### Tournament Morning

- Open WeighFish at the registration table
- Enter each walk-up team or individual
- Record Cash or Card in WeighFish
- For Card, process payment through the Square reader with the 3% Card
  Processing Fee
- Use the paper form only if the normal operational workflow is unavailable

### Before Launch

- The Tournament Director confirms all anglers are entered into WeighFish.
- This is an operational checklist item, not a website status.

### After Tournament

- Export the official WeighFish CSV
- Upload the CSV through AITT's future protected import workflow
- Validate and preview before final import
- The website updates:
  - Results
  - Standings
  - AOY
  - Tournament history
  - Any supported payout information

The import must preserve the source filename, import timestamp, tournament
association, and validation outcome. It may import payment method when the CSV
provides that field. Unknown values remain available for review rather than
being guessed. This protected import is planned and is not currently
implemented.

Post-tournament membership reconciliation is a later implementation phase and
is not part of the current CSV-import workflow.

## 9. Public Tournament Entries Page

The read-only **Tournament Entries** page uses a compact, spreadsheet-style
table that remains usable for 100 or more entries. A compact summary appears
above the table, and the page is linked from the Home and Registration pages.
The summary values are calculated from the current registration records and
show:

- Total Tournament Entry count
- Team Entry count
- Solo Entry count
- Big Bass participation count
- Bronze participation count
- Silver participation count
- Gold participation count
- Insurance Pot participation count
- Registration closing date and exact time, when available

The table shows:

- Public display names for Angler 1 and Angler 2, or `Solo`
- Exact registration timestamp in `America/Chicago`
- Big Bass selection
- At most one member Bonus Pot selection: Bronze, Silver, or Gold
- Insurance Pot selection

Entries are sorted by registration timestamp from oldest to newest. Tournament
Entry is required and implicit for every valid registration, so it is not shown
as a redundant column.

Visible optional-pot participation gives anglers a clear view of the field and
may encourage additional pot participation.

The public model is an explicit privacy-safe projection. It must not expose
email addresses, phone numbers, street addresses, full tax information,
payment or membership-payment details, administrative notes, internal or
database IDs, reconciliation data, or WeighFish data. The page receives only
approved public fields rather than full private registration records.

### Homepage Tournament Dashboard

The Home page is the primary public tournament dashboard. It presents the
next relevant tournament name, lake, date, launch location, current
registration state, and the strongest available registration action before
secondary content. When registration is open, the primary action is **Register
Now** and the companion action is **View Tournament Entries**. When it is
closed, the page states **Registration Closed** and does not present an active
registration link.

The dashboard includes the dynamically derived total Tournament Entries, Team
Entries, Solo Entries, Big Bass, Bronze, Silver, Gold, and Insurance Pot
counts. It also displays the exact early-registration deadline in
`America/Chicago`, plus concise links to the existing tournament details,
Rules, and Results surfaces. Zero values remain visible and understandable.

Only the explicit privacy-safe public entry projection may supply homepage
counts. Names, email addresses, phone numbers, street addresses, payment
details, administrative notes, internal identifiers, and other private
registration data must not be passed to or rendered by the homepage.

## 10. Estimated Safe Light

All tournaments occur within the Dallas-Fort Worth area. The website uses Fort
Worth, Texas, as the reference location.

Estimated safe light is calculated as:

> Official Fort Worth sunrise for the tournament date minus 30 minutes

The calculation must use the `America/Chicago` time zone. Automatic daylight-
saving adjustments must occur through that time zone. The website does not
need to store latitude or longitude for every lake.

The application calculates sunrise internally with the lightweight `suncalc`
library and a centralized Fort Worth reference coordinate. Page rendering does
not depend on a live sunrise or weather service. A manual safe-light override
changes the displayed estimate without replacing the underlying calculated
sunrise or calculated safe-light value.

Display the estimate on the Home page and Registration page using this wording:

> **Estimated Safe Light**
>
> Approximately HH:MM AM
>
> Be on the water and prepared to launch before this time.
>
> Final launch timing is determined by Tournament Officials.

The Tournament Director must be able to manually override the calculated
estimate.

## 11. Weather Monitoring and Tournament Decisions

The Home page uses a compact **Tournament Conditions** panel that combines the
current Tournament Status, application-calculated Safe Light, and supplemental
AccuWeather forecast data for the tournament date and configured location.
Safe Light remains controlled by the calculation and override rules in section
10; AccuWeather astronomy values do not replace it. Forecast data never changes
Tournament Status automatically. Delays, postponements, cancellations, and
other operational decisions remain under Tournament Director authority.

Forecast data may be pending outside the provider's forecast horizon or
temporarily unavailable. Missing configuration, invalid provider responses,
and provider failures must not prevent the Home page, Tournament Status, or
Safe Light from rendering. Displayed weather update times use
`America/Chicago`. Wherever AccuWeather data appears, visible linked **Weather
data by AccuWeather** attribution is required. An official logo may be used
only when obtained and licensed from AccuWeather; it must not be invented,
redrawn, or imitated.

Weather strongly affects tournament operations. The Tournament Director uses
the following weather applications as primary decision references:

- AccuWeather
- Weather Underground

Wind gusts of **30 MPH or greater** will normally result in a tournament delay
or postponement.

Other conditions that may result in a delay, postponement, or cancellation
include:

- Lightning
- Severe storms
- Flooding
- Unsafe ramps
- Unsafe water
- Dense fog
- Government or marina closures
- Any unsafe condition determined by the Tournament Director

The Tournament Director has final authority over weather and safety decisions.
AccuWeather and Weather Underground are human decision references, not
automated website integrations. The site does not scrape either service or
make tournament decisions automatically.

## 12. Tournament Status

Support the following public tournament statuses:

- Scheduled
- Weather Watch
- Delayed
- Postponed
- Cancelled
- Rescheduled

The Home page must display the current tournament status. When the status is
Scheduled, the notice may remain compact. Weather Watch, Delayed, Postponed,
Cancelled, or Rescheduled notices must be prominent and difficult to miss.

The public notice should include:

- Tournament
- Current status
- Date and time updated
- Short explanation
- Instructions for anglers
- Replacement date when applicable

Do not create or display a public weather-decision history. Only the current
official status and announcement need to be displayed.

## 13. Tournament Status and Announcements

Rename **Latest News** to **Tournament Status & Announcements**.

It may include:

- Weather updates
- Delays
- Postponements
- Cancellations
- Rescheduled dates
- Registration reminders
- Schedule changes
- Championship information
- Important tournament announcements

The current weather or tournament decision should be immediately visible when
relevant.

## 14. Postponements and Cancellations

If a tournament is postponed:

- The website must show the Postponed status
- Instructions must be published
- A replacement date should be shown when available
- Existing registration handling must follow the final published policy

If a tournament is cancelled:

- The website must show the Cancelled status
- Instructions must be published
- Registration, credit, and refund handling must follow the final published
  policy

The detailed refund-versus-credit policy is **pending business confirmation**.
No final financial policy should be inferred or implemented until approved.

## 15. Registration Page Requirements

The Registration page must display:

- Selected tournament
- Tournament date
- Launch location
- Early online registration deadline
- Tournament-morning registration instructions and any published operating
  hours
- Current registration status
- Estimated safe light
- Safe-light disclaimer
- Solo or Team selection
- Required angler information
- Membership selections
- Entry selections organized as:
  - Tournament Registration: Tournament Entry — Required
  - Optional Side Pots: Big Bass and Insurance Pot
  - Member Bonus Pots: Bronze, Silver, and Gold
- Tournament Entry as a mandatory, non-removable line item
- Member eligibility rules
- Itemized Registration Summary
- Registration Subtotal, Card Processing Fee (3%), and Total Charged
- Notice that credit or debit card payment through Square is required online
- Notice that registration is confirmed only after successful payment
- Notice that cash is accepted only in person through the Tournament Director's
  WeighFish workflow

The page must determine whether Early Online Registration is open or closed.
After the online deadline, it directs anglers to the in-person Tournament
Director and WeighFish workflow rather than accepting a website submission.

Registration availability must be based on server time, the `America/Chicago`
time zone, and configured tournament deadlines.

## 16. Rules Page Updates

The Rules page must explain:

- Tournament Entry is required for every registration
- Big Bass is optional and is not a standalone entry
- Bronze, Silver, Gold, and Insurance Pot are optional member-only selections
  that require Tournament Entry; both team members must be current members for
  team benefits

- Early Online Registration closes at 9:00 PM `America/Chicago` time on the
  evening before the tournament
- Tournament-Morning Registration is a normal in-person registration period
  operated by the Tournament Director in WeighFish
- Cash has no processing fee; Square-reader card payments include the 3% Card
  Processing Fee
- Estimated Safe Light is the official Fort Worth sunrise for the tournament
  date minus 30 minutes, using the `America/Chicago` time zone
- Estimated Safe Light is not a guaranteed launch schedule
- The Tournament Director determines final launch timing
- AccuWeather and Weather Underground are used as primary weather references
- Wind gusts of 30 MPH or greater will normally result in a delay or
  postponement
- Unsafe conditions may cause delay, postponement, cancellation, or
  rescheduling
- The website is the official source for tournament status and instructions

Until a dedicated Rules document or page is approved and created, this section
is the authoritative source for these requirements.

## 17. FAQ Updates

Keep the FAQ concise by combining related questions.

### When can I register for a tournament?

Early Online Registration closes at 9:00 PM local tournament time on the
evening before the tournament and requires successful Square card payment.
Tournament-Morning Registration is completed in person with the Tournament
Director and recorded in WeighFish.

### Is there a fee for paying by credit or debit card?

Yes. AITT adds a 3% card-processing fee to all credit- and debit-card payments.
This applies to Early Online Registration and to card payments made through the
Square reader during Tournament-Morning Registration. Cash payments made at
Tournament-Morning Registration do not include the Card Processing Fee.

### How can I pay on tournament morning?

Register with the Tournament Director at the registration table. Payment may
be made with cash or with a credit or debit card through the Square reader.
Card payments include the 3% Card Processing Fee, and the Tournament Director
records the registration and payment method in WeighFish.

### What time should I arrive, and what is Estimated Safe Light?

Estimated safe light is the official Fort Worth sunrise for the tournament
date minus 30 minutes, using the `America/Chicago` time zone, and is provided
for planning purposes. Anglers should be on the water and prepared to launch
before that time. Tournament Officials determine final launch timing.

### How are weather decisions made?

AccuWeather and Weather Underground are the primary reference sources. Wind
gusts of 30 MPH or greater will normally result in a delay or postponement.
Lightning and other unsafe conditions may also affect the event. The
Tournament Director has final authority, and the website's **Tournament Status
& Announcements** section is the official source for updates.

### What happens if a tournament is postponed or cancelled?

The current status and instructions will be posted on the website. A
rescheduled date will be posted when available. Registration transfer, refund,
or credit instructions will be included in the official announcement. No final
refund policy applies until it has been approved.

### Do both team members have to be members?

Yes. Both anglers must be members for the team to receive member benefits.
Those benefits include Bronze, Silver, Gold, Insurance Pot, AOY points, and
Championship eligibility.

### What entry options are available?

Tournament Entry is required for every solo or team registration. Big Bass is an
optional add-on. Bronze, Silver, Gold, and Insurance Pot are optional member-only
selections that require Tournament Entry; Bronze, Silver, and Gold are mutually
exclusive, and both team members must be current members for team benefits.

Until a dedicated FAQ document or page is approved and created, this section
is the authoritative source for these requirements.

## 18. Privacy and Security

Private registration information must never appear on public pages. Sensitive
information includes:

- Email
- Phone
- Address
- Payment identifiers
- Administrative notes

Administrative access must require authentication. Server-side authorization
must protect registration records and admin actions; hidden navigation links
or client-side checks alone are not sufficient.

Payment card data must be handled by the payment processor and must not be
stored in the application database.

## 19. Implementation Principles

Future implementation should:

- Use centralized tournament configuration
- Use server-generated timestamps
- Use the `America/Chicago` time zone with automatic daylight-saving
  adjustments
- Enforce pricing and eligibility on the server
- Calculate card amounts in integer cents; the Card Processing Fee is the
  card-payment subtotal multiplied by 3%, rounded to the nearest cent with
  half-cent results rounded upward
- Recalculate online amounts on the server, use Square idempotency keys, and
  confirm registration only after a successful Square payment
- Always include Tournament Entry in registration pricing and reject standalone
  add-ons
- Use Tournament Entry in all public and business-facing copy. The stable
  internal code identifier `baseEntry` may remain in implementation.
- Keep public and private data clearly separated
- Keep the public Tournament Entries page simple
- Make weather and status notices easy to update
- Keep Tournament-Morning Registration in WeighFish and the Square reader
- Support future database and payment integrations without rewriting the
  registration form

## 20. Open Decisions

Currently unresolved business decisions are:

- Final refund-versus-credit policy for cancelled tournaments
- Exact Tournament-Morning Registration operating hours and cutoff policy
- Whether the public Tournament Entries page shows full team names or
  abbreviated names
