Version: 1.0
Last Updated: July 27, 2026

# All-In Tournament Trail UI Style Guide

## Purpose

This guide keeps public wording consistent, clear, and familiar to tournament
anglers. It incorporates the durable principles from the archived compact UI
standards and remains the current visual guidance without creating a broader
design system.

## Terminology

| Use | Avoid in public UI | Notes |
|---|---|---|
| Tournament Entry | Base Entry | Required for every registration. |
| Tournament Entries | Public Registrations, Registration Records, Entry Database | Preferred public entry-list page title. |
| Tournament Conditions | Weather Widget | Combines status, Safe Light, and a compact five-day forecast. |
| Team Entries | Teams Registered | Tournament Entries summary label. |
| Solo Entries | Individual Entries | Tournament Entries summary label. |
| Register Now | Submit Registration | Primary homepage action while registration is open. |
| Registration closes | Registration cutoff | Introduces the exact published deadline. |
| Insurance Pot | Insurance | Use the full name for the selectable pot. |
| Tournament Director | Admin | Use “AITT Admin Center” for the product area. |
| Safe Light | Launch Time | Final launch timing remains the Tournament Director’s decision. |
| Tournament Status | Event Status | Use for public operational status. |
| Early Registration | Early Online Registration when brevity is appropriate | Use the longer term when distinguishing submission methods. |
| Tournament Morning Registration | Late Registration | It is a normal registration period. |
| Registration Closed | Unavailable | State the outcome plainly. |
| Current Member | Existing Member | Match registration choices. |
| Purchase Membership | Join | Make the purchase action clear. |
| Purchase Seasonal Membership | Add the $40 membership charge for a new angler. |
| Practice and Off-Limits Policy | Prefishing policy | Controlling public rules terminology. |
| One official practice day | Practice weekend | Each registered team or solo entry chooses Friday or Saturday, not both; team members share one allowance. |

Technical identifiers such as `baseEntry`, `registrationPeriod`,
`safeLightOverride`, and `tournamentStatus` may remain in code.

## Registration Option Grouping

- Tournament Registration
  - Tournament Entry — Required
- Optional Side Pots
  - Big Bass
  - Insurance Pot
- Optional Payout Pots
  - Bronze
  - Silver
  - Gold

Tournament Entry is automatic and non-removable. Bronze, Silver, and Gold are
mutually exclusive. Membership explanations should appear near seasonal
choices.

## Buttons

Prefer:

- Register
- Continue
- Save
- Cancel
- View Tournament Entries

Avoid “Submit Form,” “Execute,” and “Save Record.” Button labels should describe
the action an angler or Tournament Director expects.

## Validation and Error Messages

- Say what happened.
- Tell the angler how to fix it.
- Avoid implementation terminology.
- Keep messages specific and brief.

Examples:

- “Tournament Entry is required to register.”
- “Big Bass can only be added with Tournament Entry.”
- “Every angler must have a current membership or purchase the $40 seasonal
  membership during registration.”
- “Choose only one payout pot: Bronze, Silver, or Gold.”

## Dates and Times

- Date: July 12, 2026
- Time: 6:30 AM or 9:00 PM
- Business and system time zone: `America/Chicago`

Public pages do not need a time-zone label beside every time. Show “local
tournament time” or `America/Chicago` when a deadline or policy could otherwise
be ambiguous, following the existing registration and operations conventions.

## Accessibility and Clarity

- Do not rely on color alone.
- Identify required and optional choices in text.
- Keep labels visible rather than relying on placeholder text.
- Use plain language.
- Preserve keyboard and screen-reader usability.

## Public Entry Lists

- Use a compact table rather than cards when large entry sets are expected.
- Keep summary statistics concise and scan-friendly.
- Keep detailed entry and optional-pot statistics on the Tournament Entries
  page. Use concise registration and entry-list calls to action on the homepage.
- Use these summary labels: Tournament Entries, Team Entries, Solo Entries,
  Big Bass, Bronze, Silver, Gold, and Insurance Pot.
- Use **Insurance Pot** in rules, forms, and summaries. The approved compact
  public Results-row winner badge may use **INSURANCE** to avoid stretching
  Team rows; it does not replace the full Insurance Pot summary.

## Tournament Conditions

- Use Tournament Conditions, Tournament Status, Safe Light, Next 5 Days,
  Rain, and Weather data by Open-Meteo.
- Keep homepage weather compact and secondary to primary tournament content.
- Present available daily forecasts in chronological order with concise
  weekday, condition indicator, high/low, and optional precipitation labels.
- The rolling forecast begins with the current `America/Chicago` calendar date
  and is not selected relative to the tournament date.
- Keep Safe Light on the left and the five-day forecast on the right in one
  compact row on larger screens.
- On small screens, contain any horizontal scrolling inside the forecast
  region and never introduce page-level horizontal overflow.
- Do not use weather color alone as a safety indicator.
- Do not present provider output as an official tournament decision.
- Prefer text plus a restrained status indicator, and always include the status
  text so color is not the only signal.
- Keep **Register Now** visually dominant over forecast content and secondary
  links.
- Use **Weather data by Open-Meteo** as visible linked attribution whenever
  provider data appears.

## Schedule Badges

- Use a compact gold BASS STACK badge inside the schedule lake-image area only
  for tournaments explicitly designated as Bass Stack Challenge events.
- Keep the badge readable on mobile and desktop, and provide accessible text
  that identifies the event format.

## Homepage Announcements

- Keep **Latest News & Announcements** visible and visually distinct on mobile
  and desktop as the primary public communication surface.
- Keep Tournament Conditions compact in the established Safe Light area.

## Approved public-content simplifications

- How AITT Works uses Join the Trail, the $60 Tournament Entry, one optional
  Bronze/Silver/Gold pot, optional Big Bass and Insurance, Simple Strategy, and
  Done. Go Fish. The obsolete “One Tournament. Four Ways to Compete” cards and
  eligibility badges are not active content.
- AOY and Championship copy describes official finish position, best 5 of 8,
  automatic dropping of the three lowest scores, and five-of-eight
  participation without distinguishing current members from non-members.
- Insurance copy may be concise, but its public 1-in-5 payout table remains the
  calculator and explanation authority.
- Registration uses the established public-page header styling. The Square /
  Apple Pay / Pay at the Ramp graphic is removed. Estimated Safe Light remains
  functional and aligns with Registration Summary.
- Confirmation displays `REGISTRATION NUMBER`. The customer-facing fee label is
  `SQUARE SERVICE FEE`, without appending “3%”.
- How AITT Works always links Register to `/register`; that page displays the
  tournament's open or closed state.

## Scope

This guide applies to public pages, registration, Rules and FAQ, confirmation
screens, receipts and emails, user-facing AITT Admin Center wording, and future
features.


---
For an overview of the project, begin with **00_START_HERE.md**.
