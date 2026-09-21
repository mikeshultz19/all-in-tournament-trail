Version: 1.0
Last Updated: July 27, 2026

# Tournament Operations and Registration Process

The complete website-outage and printed-roster procedure is documented in
[Tournament Disaster Recovery](TOURNAMENT_DISASTER_RECOVERY.md).

## Registration confirmation variants

Verified online registrations retain the approved online confirmation wording
and their legitimate Square payment-attempt linkage. Successfully saved
walk-ups queue the walk-up wording only after the durable save transaction. The
walk-up message uses the stored registration number, participant names,
itemized selections and per-person membership charges, recorded Cash/Card/Other
method, and recorded total. It is a registration confirmation, not a Square
receipt, and does not invent an online Square service fee.

Recipients are trimmed, lowercased, and deduplicated consistently for online
and walk-up registrations. Database uniqueness and the provider idempotency key
prevent resubmission, refresh, editing, attendance, review, export, or printing
from creating another automatic confirmation. A walk-up without an
email remains saved, queues nothing, and reports `Confirmation not sent — no
email provided.` Delivery failure preserves the registration and remains in the
retry workflow. The No Show cleanup migration is applied to staging; an
authenticated allowlisted delivery rehearsal remains outstanding.

## Tournament funds review

Registration Review presents the operational incoming-money view. Financial
Summary provides the central tournament selector and uses the same shared
calculation: membership counts/revenue reflect purchased line items only,
payout funds exclude Square service fees, and Check-In and DQ do not
alter collected totals. Tournament Manager compares the same payout-funds total
with calculated checks. Totals are live-calculated unless an existing closeout
supplies payout checks/status; historical collection snapshots are not yet
immutable. Walk-up card snapshot discrepancies and refund/credit rules remain
documented gaps.

> **Consolidated 2026-08-25.** Current staff procedure is maintained in
> [AITT Tournament Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md).
> This longer document is retained as supporting design/history. Automatic
> registration deadlines, Featured-controlled registration, standalone
> Insurance steps, or older payout/check sequences below are superseded and
> non-authoritative.

> Implementation note (2026-07-29): Protected import/publication, identity
> reconciliation, Official Results, AOY, and Championship qualification are
> implemented. Use the Knowledge Base for executable current operations.

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

### Competitive Record

Each tournament registration records whether the competitor is fishing that
tournament as a Team or as a Solo competitor. AITT has one Angler of the Year
competition and one Championship qualification path. Solo registration applies
only to that tournament and does not create a separate season-long division.

For Team registration, Angler 2 is required. The established season partner is
entered even when that partner is unable to fish the tournament.

For Solo registration, Angler 2 is prohibited and is not submitted.

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
- Purchase the $40 seasonal membership

Every registered angler may select any available side pot. Membership also
supports access to:

- Bronze
- Silver
- Gold
- Insurance Pot
- AOY points
- Championship eligibility
- One official practice day immediately before an event for each registered
  team or solo entry

Historical non-member records remain preserved, but new online and walk-up
registrations require membership.

### Practice and Off-Limits Policy

Before every tournament event, tournament waters are off-limits to all anglers
registered to compete in that tournament beginning at **12:00 AM midnight on
Monday of tournament week**. Each registered team or solo entry receives one
official practice day immediately before the event and may choose either Friday
or Saturday, but not both. For a team, both anglers share the single allowance;
practice by either team member, alone or together, consumes it. Registration
must be complete before practice begins. Changing boats, anglers, partners, or
passengers does not create another practice day.

The public Rules page is the controlling public source for this policy. This
documentation defines the same business rule but does not implement automated
membership verification, event-registration checks, or practice-day
selection.

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

**Authoritative pricing:** Tournament Entry/Base Entry is **$60**. Earlier $40
Base Entry references are obsolete. Membership remains **$40 per angler** and
Bronze remains **$40**.

The staging Tournament Funds Summary uses the shared collection calculator and
the complete active roster. It counts new memberships per individual angler,
separates expected joining revenue from membership charges actually collected,
and flags classification/payment mismatches without discarding supported money.
It separates face-value tournament payout funds from membership revenue and excludes Square service fees. Collected
online rows require completed payment evidence; active walk-ups require a
payment reference and Cash, Card, or Other method. Checked In, DQ,
search, filters, pagination, and page size do not change collection totals.
Cancelled, failed, abandoned, duplicate/unpaid, and unresolved refund/credit
records are not treated as collected. Existing walk-up totals may differ from
face-value selections, and Card snapshots retain a known zero-fee persistence
discrepancy; the summary derives selections without rewriting those records.
Actual Square fees and bank deposits remain outside the stored application data.

### Registration cancellation

Use the single roster-level Cancel Registration control beside Check-In and
Add Walk-Up. Select the active boat, review the registration number,
participants, itemized charges, and total paid, then record a required reason
and whether the full manual Chase refund is pending or completed. Cancellation
applies to the whole team or solo registration and does not issue a Square
refund. Memberships purchased on that registration are revoked from their
recorded purchase lines; pre-existing memberships are not revoked. Canceled
registrations remain in the Canceled and All Registrations views for audit, but
are excluded from active operations, funds/payouts, exports, results, AOY, and
Championship eligibility.

**Big Bass** is optional and is not a standalone tournament entry.

**Bronze, Silver, and Gold** are optional, mutually exclusive selections available to every registered angler.
Bronze pays 1-in-5. Silver pays 1-in-5. Gold pays 1-in-7.

**Insurance Pot** costs **$20**, requires Tournament Entry, and is available to every registered angler.
It uses a true 1-in-5 payout, with a minimum of one paid place whenever there
are Insurance Pot entries. Payouts begin with the first eligible team outside
the Tournament Entry payout.

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
and the Square Service Fee is 3% of the card-payment subtotal plus $0.30 per
transaction. Tournament
officials use the confirmed registrations as part of the pre-tournament
WeighFish workflow.

## 6. Tournament-Morning Registration

Tournament-Morning Registration is a normal walk-up registration option and
must not be described as late registration. It is conducted by the Tournament
Director at the registration table in WeighFish, not through the AITT website.

The Tournament Director enters the team or individual in WeighFish and records
Cash or Card. Cash has no processing fee. Card payments are processed
separately through the Square reader and include the same Square Service Fee
(3% plus the internal $0.30 transaction component) used online. A paper form is maintained only as emergency operational
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
- Card-payment subtotal, Square Service Fee, and total charged for Early
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

## 8. AITT Admin Center

Supabase Auth is implemented, and the Tournament Director must log in to the
protected AITT Admin Center. Public users
must not have access to administrative controls or private registration
details.

AITT Admin Center must eventually allow the Tournament Director to:

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
- For Card, process payment through the Square reader with the Square Service
  Fee (3% plus the internal $0.30 transaction component)
- Use the paper form only if the normal operational workflow is unavailable

### Before Launch

- The Tournament Director confirms all anglers are entered into WeighFish.
- This is an operational checklist item, not a website status.

### After Tournament

- Export the official WeighFish CSV
- Upload the CSV through AITT's protected import workflow
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
being guessed. This protected import/review workflow is implemented.

Post-tournament membership and identity reconciliation are implemented as part
of the current import/review workflow and must be resolved before publishing
Official Results and updating AOY or Championship standings.

### Bass Stack Challenge Events

Tournament #5 at Squaw Creek and tournament #8 at Lewisville use the AITT
Bass Stack Challenge format.

The Bass Stack Challenge is an MLF-inspired cumulative-weight competition in
which every legal fish officially weighed contributes to the angler or team
total. The operational rules for these designated events are:

- Anglers may weigh an unlimited number of legal fish during the tournament.
- No more than three fish may be presented for weighing at one time.
- Culling up to three fish is permitted.
- Every fish counted toward the final total must satisfy all applicable AITT
  legal-fish, size, species, handling, and tournament requirements.
- The format applies only to the designated Bass Stack Challenge events.

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
- At most one payout pot selection: Bronze, Silver, or Gold
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
saving adjustments must occur through that time zone. Safe Light does not
require per-lake coordinates. The separate weather forecast requires approved
tournament latitude and longitude values.

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
Open-Meteo five-day daily forecast data for the configured tournament
coordinates. Available
days appear in chronological order beginning with the current
`America/Chicago` calendar date. The rolling display is not selected relative
to the tournament date. Safe Light appears on the left and the forecast uses
the remaining space in the same compact row on larger screens.
Safe Light remains controlled by the calculation and override rules in section
10; Open-Meteo data does not replace it. Forecast data never changes
Tournament Status automatically. Delays, postponements, cancellations, and
other operational decisions remain under Tournament Director authority.

The rolling five-day forecast remains the same when the tournament is outside
the provider horizon and is not represented as tournament-day weather.
Forecast data may be temporarily unavailable. Missing configuration, invalid
provider responses, and provider failures must not prevent the Home page,
Tournament Status, or Safe Light from rendering. Displayed weather update times
use `America/Chicago`. Requests are server-side, use Fahrenheit and mph, and do
not require an API key. Missing coordinates show a compact configuration
fallback. Wherever Open-Meteo data appears, visible linked **Weather data by
Open-Meteo** attribution is required. Production use must comply with
Open-Meteo's then-current licence, attribution, usage, and commercial terms.

Weather strongly affects tournament operations. The Tournament Director uses
the following weather applications as primary decision references:

- Open-Meteo
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
Open-Meteo and Weather Underground are human decision references, not
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
  - Payout Pots: Bronze, Silver, and Gold
- Tournament Entry as a mandatory, non-removable line item
- Member eligibility rules
- Itemized Registration Summary
- Registration Subtotal, Square Service Fee, and Total Charged
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
- Bronze, Silver, Gold, and Insurance Pot are optional selections available to
  every registered angler and require Tournament Entry

- Registration availability is controlled by each tournament's lifecycle state;
  any stored deadline is informational unless explicitly enabled by the current
  operating decision
- Tournament-Morning Registration is a normal in-person registration period
  operated by the Tournament Director in WeighFish
- Cash has no processing fee; Square-reader card payments include the Square
  Service Fee (3% plus the internal $0.30 transaction component)
- Estimated Safe Light is the official Fort Worth sunrise for the tournament
  date minus 30 minutes, using the `America/Chicago` time zone
- Estimated Safe Light is not a guaranteed launch schedule
- The Tournament Director determines final launch timing
- Open-Meteo and Weather Underground are used as primary weather references
- Wind gusts of 30 MPH or greater will normally result in a delay or
  postponement
- Unsafe conditions may cause delay, postponement, cancellation, or
  rescheduling
- The website is the official source for tournament status and instructions
- The Practice and Off-Limits Policy applies before every event
- Registered anglers are off-limits beginning at 12:00 AM midnight on Monday of
  tournament week, except for the one official practice day assigned to each
  registered entry
- Each registered team or solo entry may use Friday or Saturday immediately
  before the tournament, but not both; team members share that single allowance
- Registration must be complete before practice and changing boats, anglers,
  partners, or passengers does not create another practice day

Until a dedicated Rules document or page is approved and created, this section
is the authoritative source for these requirements.

## 17. FAQ Updates

Keep the FAQ concise by combining related questions.

### When can I register for a tournament?

Early Online Registration requires successful Square card payment. Public
availability is controlled by each tournament's lifecycle state; any stored
deadline is informational unless explicitly enabled by the current operating
decision.
Tournament-Morning Registration is completed in person with the Tournament
Director and recorded in WeighFish.

### Is there a fee for paying by credit or debit card?

Yes. AITT applies the Square Service Fee (3% of the applicable subtotal plus
$0.30 per transaction) to all credit- and debit-card payments. This applies to
Early Online Registration and to card payments made through the Square reader
during Tournament-Morning Registration. Cash payments made at Tournament-
Morning Registration do not include the Square Service Fee.

### How can I pay on tournament morning?

Register with the Tournament Director at the registration table. Payment may
be made with cash or with a credit or debit card through the Square reader.
Card payments include the Square Service Fee (3% plus the internal $0.30
transaction component), and the Tournament Director
records the registration and payment method in WeighFish.

### What time should I arrive, and what is Estimated Safe Light?

Estimated safe light is the official Fort Worth sunrise for the tournament
date minus 30 minutes, using the `America/Chicago` time zone, and is provided
for planning purposes. Anglers should be on the water and prepared to launch
before that time. Tournament Officials determine final launch timing.

### How are weather decisions made?

Open-Meteo and Weather Underground are the primary reference sources. Wind
gusts of 30 MPH or greater will normally result in a delay or postponement.
Lightning and other unsafe conditions may also affect the event. The
Tournament Director has final authority, and the website's **Tournament Status
& Announcements** section is the official source for updates.

### What happens if a tournament is postponed or cancelled?

The current status and instructions will be posted on the website. A
rescheduled date will be posted when available. Registration transfer, refund,
or credit instructions will be included in the official announcement. No final
refund policy applies until it has been approved.

### When can I practice before a tournament?

Beginning at 12:00 AM on Monday of tournament week, tournament waters are
off-limits to anglers competing in the event. Each registered team or solo entry
may use one official practice day, choosing either Friday or Saturday
immediately before the tournament. Team members share that allowance, and
practice on both days is not permitted.

### What entry options are available?

Tournament Entry is required for every solo or team registration. Big Bass is an
optional add-on. Bronze, Silver, Gold, and Insurance Pot are optional selections
available to every registered angler and require Tournament Entry; Bronze,
Silver, and Gold are mutually exclusive.

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
- Calculate card amounts in integer cents; the Square Service Fee is the
  card-payment subtotal multiplied by 3%, rounded to the nearest cent with
  half-cent results rounded upward, plus $0.30 once per transaction. Show
  customers `SQUARE SERVICE FEE` with only the calculated dollar amount;
  do not expose the fixed-component formula.
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


---
For an overview of the project, begin with **00_START_HERE.md**.

## Membership review and collected funds

Registration may complete before membership verification. If an Existing Member
claim cannot be verified, it remains in Needs Review and continues to block
Tournament Preparation, but it adds no hypothetical money to the Financial
Summary. Staff verifies status and collects payment before selecting Confirm
Membership Purchase. Only confirmed collected membership money is included;
Confirm Existing Member add $0. Processor and bank
reconciliation remain separate. Walk-up snapshots can remain lump-sum and are
retained as a known auditability limitation.

AITT does not track No Show as a separate application status. Staff handles
attendance operationally through the ordinary Check-In workflow. No replacement
automated absence workflow is introduced.
