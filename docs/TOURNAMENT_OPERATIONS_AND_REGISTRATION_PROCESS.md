# Tournament Operations and Registration Process

## 1. Purpose

This document defines the official registration, tournament-morning, weather,
public-information, and Tournament Director workflows for All-In Tournament
Trail. Application behavior should follow this document unless these
requirements are later amended.

## 2. Registration Types

The site supports:

- Solo registration
- Team registration

For Team registration, information is collected independently for Angler 1 /
Boater and Co-Angler. Each angler provides:

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

For a team to receive member benefits, both the boater and co-angler must be
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

The website stores these registrations. Tournament officials use them to
manually enter anglers into WeighFish as described in the WeighFish Workflow.

## 6. Tournament-Morning Registration

Tournament-morning registration is a normal registration option and must not
be described as late registration.

Morning registration generally begins approximately two hours before
estimated safe light. A common opening time may be around 5:00 AM, but the
exact opening and closing times must be configurable for each tournament.

Anglers may register tournament morning by:

- Completing a paper form at the registration line
- Registering on the website using a phone or other device

Website registrations submitted during the configured morning window are
classified as `tournament_morning`. They must receive a server-generated
timestamp.

Tournament officials use those timestamps and registration-period labels to
identify registrations received after the previous evening's 9:00 PM early
online registration deadline.

## 7. Registration Record Requirements

Every online registration must store enough information to identify:

- Tournament
- Solo or Team registration
- Angler information
- Co-Angler information when applicable
- Membership selections
- Entry selections
- Selected payout pots
- Itemized charges
- Total paid
- Payment status
- Registration period
- Server-generated submission timestamp

Suggested `registrationPeriod` values:

- `early_online`
- `tournament_morning`

Suggested `paymentStatus` values:

- `pending`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`, if later needed

## 8. Tournament Director Admin Portal

The Tournament Director must log in to a protected Admin Portal. Public users
must not have access to administrative controls or private registration
details.

The Admin Portal must allow the Tournament Director to:

- Select a tournament
- View all online registrations
- Filter Early Online registrations
- Filter Tournament-Morning registrations
- See submission timestamps
- See selected entry and payout pots
- See payment status
- Export registration information if needed
- Update tournament status
- Publish the current weather or tournament announcement
- Delay, postpone, cancel, or reschedule a tournament
- Override estimated safe light when necessary

## WeighFish Workflow

The website stores registrations. Tournament officials manually enter anglers
into WeighFish. The website does not verify or track this process.

### Night Before

- Retrieve Early Online registrations
- Enter anglers into WeighFish manually

### Tournament Morning

- Collect paper registrations
- Review Tournament-Morning online registrations
- Enter remaining anglers manually into WeighFish

### Before Launch

- The Tournament Director confirms all anglers are entered into WeighFish.
- This is an operational checklist item, not a website status.

### After Tournament

- Export the official WeighFish CSV
- Upload the CSV into the website
- The website updates:
  - Results
  - Standings
  - AOY
  - Tournament history
  - Any supported payout information

Post-tournament membership reconciliation is a later implementation phase and
is not part of the current CSV-import workflow.

## 9. Public Early Registrations Page

Create a simple public Early Registrations page and add a clear link to it from
the Home page. The page helps potential anglers see current tournament
participation before registering.

It should show:

- Selected tournament
- Total number of preregistered entries
- Team or angler display names
- Registration timestamp
- Tournament Entry as the required entry
- Bronze, Silver, or Gold selection
- Insurance Pot selection
- Big Bass selection

It must not expose:

- Email addresses
- Phone numbers
- Street addresses
- Full tax information
- Payment identifiers
- Private administrative notes

The public page must be read-only. Keep its design simple and easy to scan.

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
- Tournament-morning registration opening time
- Tournament-morning registration cutoff
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

The page must determine whether registration is currently:

- Early Online
- Closed between registration periods
- Tournament Morning
- Fully Closed

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
- Tournament-Morning Registration is a normal registration period
- Morning registration times vary by tournament
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

Early online registration closes at 9:00 PM local tournament time on the
evening before the tournament. Tournament-morning registration is also a
normal registration option. Morning hours vary by tournament and are published
on the website.

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
- Always include Tournament Entry in registration pricing and reject standalone
  add-ons
- Use Tournament Entry in all public and business-facing copy. The stable
  internal code identifier `baseEntry` may remain in implementation.
- Keep public and private data clearly separated
- Keep the public Early Registrations page simple
- Make weather and status notices easy to update
- Make tournament-morning operations fast and easy
- Support future database and payment integrations without rewriting the
  registration form

## 20. Open Decisions

Currently unresolved business decisions are:

- Final refund-versus-credit policy for cancelled tournaments
- Exact tournament-morning registration cutoff policy
- Whether paper registrations will later be entered manually into the Admin
  Portal
- Whether the public Early Registrations page shows full team names or
  abbreviated names
