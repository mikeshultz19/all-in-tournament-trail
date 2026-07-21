# All-In Tournament Trail UI Style Guide

## Purpose

This guide keeps public wording consistent, clear, and familiar to tournament
anglers. It complements `docs/UI-Standards.md`; it does not replace the visual
standards or create a broader design system.

## Terminology

| Use | Avoid in public UI | Notes |
|---|---|---|
| Tournament Entry | Base Entry | Required for every registration. |
| Tournament Entries | Public Registrations, Registration Records, Entry Database | Preferred public entry-list page title. |
| Tournament Conditions | Weather Widget | Combines status, Safe Light, and tournament-date forecast. |
| Team Entries | Teams Registered | Tournament Entries summary label. |
| Solo Entries | Individual Entries | Tournament Entries summary label. |
| Register Now | Submit Registration | Primary homepage action while registration is open. |
| Registration closes | Registration cutoff | Introduces the exact published deadline. |
| Insurance Pot | Insurance | Use the full name for the selectable pot. |
| Tournament Director | Admin | “Admin Portal” may remain the product-area name. |
| Safe Light | Launch Time | Final launch timing remains the Tournament Director’s decision. |
| Tournament Status | Event Status | Use for public operational status. |
| Early Registration | Early Online Registration when brevity is appropriate | Use the longer term when distinguishing submission methods. |
| Tournament Morning Registration | Late Registration | It is a normal registration period. |
| Registration Closed | Unavailable | State the outcome plainly. |
| Current Member | Existing Member | Match registration choices. |
| Purchase Membership | Join | Make the purchase action clear. |
| Continue as Non-Member | Skip Membership | State the resulting status. |

Technical identifiers such as `baseEntry`, `registrationPeriod`,
`safeLightOverride`, and `tournamentStatus` may remain in code.

## Registration Option Grouping

- Tournament Registration
  - Tournament Entry — Required
- Optional Side Pots
  - Big Bass
  - Insurance Pot
- Member Bonus Pots
  - Bronze
  - Silver
  - Gold

Tournament Entry is automatic and non-removable. Bronze, Silver, and Gold are
mutually exclusive. Eligibility explanations should appear near member-only
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
- “Both anglers must be current members to enter Bronze, Silver, Gold, or the
  Insurance Pot.”
- “Choose only one member bonus pot: Bronze, Silver, or Gold.”

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
- Do not shorten Insurance Pot to Insurance.

## Tournament Conditions

- Use Tournament Conditions, Tournament Status, Safe Light, Tournament
  Forecast, Wind, Gusts, Rain, and Weather data by AccuWeather.
- Keep homepage weather compact and secondary to primary tournament content.
- Do not use weather color alone as a safety indicator.
- Do not present provider output as an official tournament decision.
- Prefer text plus a restrained status indicator, and always include the status
  text so color is not the only signal.
- Keep **Register Now** visually dominant over forecast content and secondary
  links.
- Use **Weather data by AccuWeather** as visible linked attribution whenever
  provider data appears.

## Homepage Announcements

- Keep **Latest News & Announcements** visible and visually distinct on mobile
  and desktop as the primary public communication surface.
- Keep Tournament Conditions compact in the established Safe Light area.

## Scope

This guide applies to public pages, registration, Rules and FAQ, confirmation
screens, receipts and emails, user-facing Admin Portal wording, and future
features.
