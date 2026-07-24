# Project Deployment Checklist

**Document Version:** 1.0

**Status:** Living Operational Checklist

**Owner:** Product Owner / Tournament Director

**Audience:**

- Product Owner
- Tournament Director
- Tournament staff
- Authorized administrators
- Operational vendors and advisors, when applicable

**Purpose:** Track the non-development work required to launch, operate, and
maintain the All-In Tournament Trail platform and its supporting tournament
operations.

**Related Documents:**

- [AI Relearn](AI_RELEARN.md)
- [Project Status](ProjectStatus.md)
- [Decision Log](DecisionLog.md)
- [Payment Operations Manual](PAYMENT_OPERATIONS.md)
- [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md)
- [Tournament Operations and Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)
- [Master Site Map](MasterSiteMap.md)
- [README](../README.md)

**Last Updated:** 2026-07-23

## Verified Platform Status

- [x] Registered `allintrail.com`.
- [x] Selected `https://allintrail.com` as the canonical domain.
- [x] Connected source control to GitHub.
- [x] Selected Vercel for planned production hosting.
- [x] Selected Cloudflare for domain registration/DNS where applicable.
- [x] Enabled Cloudflare Email Routing for `allintrail.com`.
- [x] Created and tested inbound forwarding for `info@allintrail.com`.
- [x] Connected the CLI and repository to hosted Supabase.
- [x] Applied the tournaments migration and seeded Lake Fork Open.
- [ ] Deploy to Vercel and configure production environment variables.
- [ ] Complete Cloudflare production DNS and HTTPS configuration.
- [ ] Redirect `www.allintrail.com` to `https://allintrail.com`.
- [ ] Implement Supabase Auth and remove anonymous update access.

Initial launch uses free service tiers. Provider selection and domain
registration do not imply deployment is complete. See
[Supabase Setup](SUPABASE_SETUP.md) for database commands.

Cloudflare Email Routing handles inbound forwarding to the verified Gmail
destination. It is not an application transactional-email service. The Contact
page and widget open the visitor's email application; the website has no
server-side contact submission endpoint.

> **Operational use:** This document tracks readiness, ownership, and completion;
> it does not replace the authoritative business rules and procedures in the
> related documents. Every item begins unchecked. Mark an item complete only
> after the work is performed and any required evidence is retained. Add newly
> discovered physical, business, legal, operational, hardware, marketing,
> training, vendor, deployment, or launch tasks to the appropriate section.

## 1. Business Setup

- [ ] Establish the legal business entity or confirm the entity under which AITT operates.
- [ ] Confirm the legal business name, public business name, address, phone number, and email address.
- [ ] Obtain any required federal, state, and local registrations, permits, or licenses.
- [ ] Open and verify the business bank account used for tournament operations.
- [ ] Confirm authorized bank-account users and signing authority.
- [ ] Create the Square business account under the approved business identity.
- [ ] Complete Square identity and business verification.
- [ ] Connect the approved business bank account to Square.
- [ ] Complete a test deposit and verify settlement reaches the correct bank account.
- [ ] Configure Square business, location, contact, and customer-facing information.
- [ ] Configure Square tax settings, if applicable, after professional review.
- [ ] Configure Square receipt branding, contact details, and delivery settings.
- [ ] Confirm the business name anglers will see on card statements and receipts.
- [ ] Document the people authorized to access Square, banking, refunds, payouts, and reconciliation records.
- [ ] Approve authority levels for payment verification, overrides, refunds, payouts, and reconciliation.
- [ ] Approve refund, credit, transfer, postponement, and cancellation policies.
- [ ] Approve policies for partial payments, overpayments, reversals, disputes, and partial refunds.
- [ ] Approve payout timing, check controls, unclaimed payouts, and tax-reporting procedures.
- [ ] Decide whether checks will be accepted for registration and document the approved controls.
- [ ] Obtain accounting and tax guidance for entry fees, memberships, payouts, processing fees, and reporting obligations.
- [ ] Establish a record-retention policy for financial, registration, waiver, payout, and tax records.
- [ ] Confirm appropriate business, event, liability, equipment, vehicle, and cyber insurance coverage.
- [ ] Create a secure inventory of vendor accounts, account owners, renewal dates, and recovery contacts.

## 2. Hardware

- [ ] Purchase and configure the primary tournament tablet.
- [ ] Purchase a weather-resistant protective tablet case.
- [ ] Purchase a stable tablet stand suitable for the registration table.
- [ ] Purchase and activate the primary compatible Square reader.
- [ ] Purchase and activate a compatible backup Square reader.
- [ ] Install all tablet operating-system and security updates.
- [ ] Install all Square reader firmware updates.
- [ ] Verify the tablet, Square application, WeighFish, and readers work together.
- [ ] Label all AITT-owned hardware and record serial numbers.
- [ ] Purchase dedicated charging cables and wall adapters for each device.
- [ ] Purchase a power bank capable of supporting a full registration period.
- [ ] Purchase a compatible vehicle charger.
- [ ] Pack weather-resistant storage for electronics and cables.
- [ ] Configure tablet screen lock, device recovery, and authorized-user access.
- [ ] Disable unneeded notifications and applications that could interrupt registration.
- [ ] Create a charging and battery-health inspection schedule.
- [ ] Maintain a hardware inventory with purchase dates, warranty details, and replacement status.

## 3. Tournament Registration Kit

- [ ] Obtain a stable registration table.
- [ ] Obtain sufficient chairs for registration staff.
- [ ] Obtain a secure cash box with controlled key or combination access.
- [ ] Establish and document the approved starting-cash amount and denominations.
- [ ] Obtain clipboards for staff and paper fallback use.
- [ ] Stock pens in sufficient quantity.
- [ ] Stock permanent markers and Sharpies.
- [ ] Print current paper registration forms for emergency fallback only.
- [ ] Print current payment, membership, and entry-option reference sheets.
- [ ] Print an incident and exception log.
- [ ] Obtain outdoor-rated extension cords and power strips where permitted.
- [ ] Obtain a tent or canopy when the venue and weather require it.
- [ ] Obtain table weights, lighting, and weather protection appropriate to the location.
- [ ] Prepare signage directing anglers to registration and accepted payment methods.
- [ ] Prepare tamper-evident envelopes or another approved method for cash transfer.
- [ ] Pack spare receipt paper only if an approved printer is used.
- [ ] Create a reusable packing list and assign responsibility for the kit.
- [ ] Inspect and restock the kit before every tournament.

## 4. Internet & Connectivity

- [ ] Verify cellular coverage for the tablet at each tournament location.
- [ ] Test the primary phone or hotspot with WeighFish and Square before launch.
- [ ] Arrange a backup hotspot or a second carrier where practical.
- [ ] Test the backup connection independently from the primary connection.
- [ ] Conduct on-site connectivity testing at the expected registration table location.
- [ ] Record known dead zones and the best alternate operating location at each venue.
- [ ] Confirm hotspot data plans, passwords, limits, and renewal dates.
- [ ] Verify staff know how to switch between primary and backup connections.
- [ ] Define the threshold for moving to paper registration during an outage.
- [ ] Re-test connectivity close to each tournament date and after carrier or venue changes.

## 5. Website Readiness

- [ ] Confirm the production deployment is approved for public launch.
- [ ] Purchase or renew the approved domain and document its owner and renewal date.
- [ ] Confirm domain contact details and account recovery methods are current.
- [ ] Verify DNS points to the approved production deployment.
- [ ] Verify SSL is active and the public site loads securely on common devices.
- [ ] Create and test official AITT email addresses used for public and operational communication.
- [ ] Confirm email sender identity, reply handling, and spam-folder behavior.
- [ ] Confirm production environment accounts and credentials are owned by AITT and recoverable.
- [ ] Confirm authorized administrators can access the production administration tools.
- [ ] Verify production tournament dates, locations, deadlines, contact details, and status are accurate.
- [ ] Verify public rules, fees, payment options, privacy information, and tournament-morning instructions are current.
- [ ] Confirm online registration remains disabled until persistence and secure Square payment confirmation are production-ready.
- [ ] Complete a production-like online registration using approved test procedures.
- [ ] Verify Square checkout displays the correct itemized subtotal, 3% Card Processing Fee, and total.
- [ ] Test successful, declined, cancelled, duplicate, and interrupted checkout outcomes.
- [ ] Test Apple Pay on a supported device and browser without implying universal availability.
- [ ] Verify card and Apple Pay branding uses only approved official assets or approved text fallbacks.
- [ ] Verify registration confirmation occurs only after Square confirms successful payment.
- [ ] Verify confirmation and failure emails contain accurate instructions and support contact details.
- [ ] Verify public registration entries do not expose private contact, address, payment, or administrative information.
- [ ] Verify tournament status and urgent announcements can be updated by an authorized person.
- [ ] Confirm AccuWeather account, subscription, API access, location keys, attribution, and usage limits are ready if live forecasts are enabled.
- [ ] Verify Safe Light and Tournament Status remain available if forecast data is unavailable.
- [ ] Test the site on the phones and browsers most likely to be used by anglers.
- [ ] Publish a support contact and define who monitors it during launch and tournament windows.
- [ ] Document domain, hosting, email, weather, and other vendor renewal dates.

## 6. WeighFish

- [ ] Create or verify the official AITT WeighFish account.
- [ ] Confirm account ownership, authorized users, recovery methods, and support contacts.
- [ ] Configure current tournament templates with approved registration and scoring settings.
- [ ] Verify tournament names, dates, divisions, entry options, and payout categories before each event.
- [ ] Confirm WeighFish records Cash or Card as required for tournament-morning registration.
- [ ] Confirm staff understand that WeighFish is the official tournament-day roster and payment-method record.
- [ ] Test the supported process for entering confirmed early online registrations the night before the tournament.
- [ ] Train the Tournament Director to create, open, operate, and close a tournament.
- [ ] Train authorized staff to enter walk-up solo and team registrations accurately.
- [ ] Test check-in, weigh-in, scoring, corrections, and official-results finalization.
- [ ] Complete a sample official CSV export.
- [ ] Confirm the CSV includes the fields needed for the approved AITT workflow.
- [ ] Preserve a clean sample CSV for future import validation.
- [ ] Validate a WeighFish CSV through the protected AITT preview and import workflow when that workflow becomes available.
- [ ] Confirm import exceptions, duplicates, possible typos, and unknown values can be reviewed without guessing.
- [ ] Establish a secure storage and retention location for official WeighFish exports.
- [ ] Document the support and fallback process for a WeighFish outage.

## 7. Tournament Morning Operations

- [ ] Confirm the tablet is present, updated, unlocked, and ready.
- [ ] Confirm the tablet battery is fully charged.
- [ ] Connect and test the primary Square reader.
- [ ] Confirm the primary reader is fully charged.
- [ ] Confirm the backup reader is charged, paired, and immediately available.
- [ ] Confirm charging cables, power bank, and vehicle charger are present.
- [ ] Confirm primary and backup internet connections are working.
- [ ] Open the correct tournament in WeighFish.
- [ ] Confirm all early online registrations have been entered into WeighFish through the supported process.
- [ ] Verify the current entry fees, memberships, optional pots, and 3% Card Processing Fee reference.
- [ ] Count starting cash with the authorized staff member and record the amount.
- [ ] Secure the cash box and limit access to authorized staff.
- [ ] Complete the staff briefing and assign registration, payment, and exception responsibilities.
- [ ] Review weather, Tournament Status, safety instructions, and any official announcement.
- [ ] Set up the registration table, signs, lighting, power, and weather protection.
- [ ] Confirm registration supplies and current paper backup forms are available.
- [ ] Register every walk-up team or individual in WeighFish.
- [ ] Record Cash or Card accurately in WeighFish for every walk-up registration.
- [ ] Process card and supported contactless-wallet payments through the Square reader.
- [ ] Apply the approved 3% Card Processing Fee to reader payments and no fee to cash.
- [ ] Keep payment-card data out of paper forms, notes, and AITT records.
- [ ] Record operational exceptions and preserve supporting evidence.
- [ ] Before launch, confirm every participating angler is entered into WeighFish.
- [ ] Announce or publish any approved status, delay, safety, or launch instruction.
- [ ] Close registration according to the approved operating-hours and cutoff policy.
- [ ] Count and secure collected cash using the approved dual-check or documented control.
- [ ] Transfer cash and records to the authorized custodian using the approved process.

## 8. Staff Training

- [ ] Train staff on the division of responsibilities among AITT, Square, and WeighFish.
- [ ] Train staff to register solo anglers and teams in WeighFish.
- [ ] Train staff to verify membership selections and member-only eligibility without making unsupported exceptions.
- [ ] Train staff to explain required Tournament Entry and optional pot selections.
- [ ] Train staff to process card and supported contactless-wallet payments through the Square reader.
- [ ] Train staff to explain the 3% Card Processing Fee and fee-free morning cash option.
- [ ] Train staff on cash acceptance, change, custody, counting, transfer, and discrepancy reporting.
- [ ] Train authorized staff on the approved refund, credit, transfer, and cancellation procedure.
- [ ] Train staff to identify and escalate duplicate, failed, disputed, partial, or uncertain payments.
- [ ] Train staff on reader, tablet, internet, and power failure procedures.
- [ ] Train staff on the paper registration fallback and later controlled data entry.
- [ ] Train staff to protect private registration, payment, address, and tax information.
- [ ] Train staff not to write down or store payment-card information.
- [ ] Train staff to record incidents, corrections, responsible persons, and times.
- [ ] Train authorized staff to export the official WeighFish CSV.
- [ ] Train authorized administrators to preview, validate, approve, and archive the AITT CSV import when available.
- [ ] Train authorized staff to publish tournament status and urgent public instructions.
- [ ] Conduct refresher training before the season and after material process changes.
- [ ] Maintain a dated training record for each staff member and role.

## 9. Disaster Recovery

- [ ] Document the decision authority and escalation contacts for operational failures.
- [ ] Test switching from the primary Square reader to the backup reader.
- [ ] Document how failed or uncertain reader transactions are verified before retrying.
- [ ] Test switching from the primary tablet to an approved backup device or paper workflow.
- [ ] Document secure restoration of required applications and access on a replacement tablet.
- [ ] Test switching from the primary internet connection to the backup hotspot.
- [ ] Define the offline communication method for staff and anglers.
- [ ] Test continued registration during a power failure using charged devices and the power bank.
- [ ] Define the point at which registration pauses because payment or roster accuracy cannot be assured.
- [ ] Prepare the paper registration fallback for a complete equipment failure.
- [ ] Define how paper registrations, cash, and unresolved card attempts are numbered and tracked.
- [ ] Define how fallback records are entered into WeighFish after service is restored.
- [ ] Require a second-person review when transferring paper fallback records into official systems.
- [ ] Define how duplicate registrations or payments caused by recovery are identified and resolved.
- [ ] Protect paper forms and devices from rain, heat, loss, theft, and unauthorized viewing.
- [ ] Maintain offline copies of essential vendor support numbers and escalation contacts.
- [ ] Document the response to a lost or stolen tablet, reader, cash box, or registration record.
- [ ] Conduct and record a disaster-recovery drill before launch and at least annually.
- [ ] Review every material incident and update this checklist and training afterward.

## 10. Marketing & Communications

- [ ] Prepare and schedule the homepage launch announcement.
- [ ] Prepare and schedule the Facebook launch announcement.
- [ ] Prepare and schedule the email launch announcement.
- [ ] Explain when Early Online Registration opens and closes.
- [ ] Explain that online registration is confirmed only after successful Square payment.
- [ ] Explain Tournament-Morning Registration as a normal in-person option, not late registration.
- [ ] Explain that morning registration is completed with the Tournament Director in WeighFish.
- [ ] Explain the 3% Card Processing Fee clearly before anglers choose a payment method.
- [ ] Explain that tournament-morning cash has no Card Processing Fee.
- [ ] Explain that Apple Pay availability depends on a supported device and browser.
- [ ] Explain supported contactless-wallet payments at the Square reader without promising unsupported methods.
- [ ] Use only current approved rules, prices, dates, locations, and contact information.
- [ ] Use only official, approved payment-provider and Apple brand assets.
- [ ] Identify the website as the official source for tournament status and instructions.
- [ ] Prepare reusable templates for delays, postponements, cancellations, rescheduling, and registration reminders.
- [ ] Confirm each template leaves room for the current status, update time, explanation, angler instructions, and replacement date when applicable.
- [ ] Establish who approves, publishes, and monitors each communication channel.
- [ ] Confirm staff know how to correct inaccurate public information promptly.
- [ ] Monitor common angler questions and update approved FAQ or operational materials as needed.

## 11. Launch Readiness

- [ ] Assign an owner and target date to every launch-blocking checklist item.
- [ ] Review all open business decisions and identify which ones must be approved before launch.
- [ ] Confirm all critical vendor accounts are active, funded where necessary, and recoverable.
- [ ] Complete an online solo registration test from start through confirmed payment.
- [ ] Complete an online team registration test from start through confirmed payment.
- [ ] Verify the online deadline at 9:00 PM `America/Chicago` on the evening before the tournament.
- [ ] Complete a successful cash registration test in the tournament-morning workflow.
- [ ] Complete a successful card-reader payment test with the 3% Card Processing Fee.
- [ ] Complete an Apple Pay test on a supported online device and browser.
- [ ] Complete a supported contactless-wallet test through the Square reader.
- [ ] Complete declined, cancelled, interrupted, and uncertain payment tests.
- [ ] Confirm Square receipts, transaction history, and deposits match the test transactions.
- [ ] Complete the night-before transfer of confirmed online registrations into WeighFish.
- [ ] Complete a tournament-morning registration simulation with realistic staffing and volume.
- [ ] Complete a paper-fallback simulation and controlled recovery into WeighFish.
- [ ] Complete the official WeighFish CSV export workflow.
- [ ] Complete CSV preview, validation, exception review, and import into AITT when the protected import is available.
- [ ] Confirm results, standings, AOY, history, and supported payout information update correctly after an approved import when those capabilities are available.
- [ ] Complete an end-to-end tournament rehearsal from registration opening through closeout and archival.
- [ ] Complete a payment reconciliation rehearsal using Square, AITT early registrations, and WeighFish records within their documented ownership boundaries.
- [ ] Verify refund, dispute, payout, exception, and incident escalation contacts are available.
- [ ] Verify staff training records and role assignments are complete.
- [ ] Verify registration kit, hardware inventory, backup equipment, and starting cash are ready.
- [ ] Confirm insurance, permits, venue approvals, and emergency contacts for the launch event.
- [ ] Obtain final go-live approval from the Product Owner and Tournament Director.
- [ ] Record the launch decision, date, approvers, known limitations, and follow-up items.

## 12. Legal, Safety & Compliance

- [ ] Have qualified counsel review participant terms, rules, waivers, privacy notices, and refund language.
- [ ] Confirm whether parental consent or additional controls are required for minors.
- [ ] Confirm applicable lake, ramp, marina, park, fishing, event, and local permit requirements.
- [ ] Obtain written venue or launch-site approval when required.
- [ ] Document emergency contacts, nearest emergency services, and venue-specific safety procedures.
- [ ] Confirm the Tournament Director's authority for weather, safety, delay, postponement, cancellation, and rescheduling decisions.
- [ ] Review the operational use and secure handling of addresses, tax information, and other private records.
- [ ] Establish a process for privacy requests, record corrections, and suspected data exposure.
- [ ] Confirm payment practices and fee disclosures comply with current provider terms and applicable law.
- [ ] Confirm marketing use of names, photos, sponsor marks, and provider branding has appropriate permission.
- [ ] Establish an incident-reporting and evidence-retention process.
- [ ] Review legal, insurance, tax, safety, and compliance requirements at least annually.

## 13. Financial Closeout & Recordkeeping

- [ ] Reconcile each tournament independently after registration and competition end.
- [ ] Compare expected early-online charges with verified Square receipts.
- [ ] Resolve or formally list pending, failed, rejected, duplicate, disputed, refunded, or manual-review items.
- [ ] Confirm the Tournament Director separately reconciles the official WeighFish morning roster and payment methods with morning cash and Square reader records.
- [ ] Verify official results and payout eligibility before approving payouts.
- [ ] Review and approve payout recipients, calculations, exceptions, and total obligations.
- [ ] Record payout method, date, recipient, check number or equivalent evidence, and delivery status.
- [ ] Record cash count, transfer, deposit, and any discrepancy with responsible persons and times.
- [ ] Record refunds, disputes, voids, reissues, and corrections without erasing original history.
- [ ] Retain the official WeighFish CSV, Square reports, reconciliation evidence, payout records, and approvals securely.
- [ ] Obtain final reconciliation approval from the authorized person.
- [ ] Lock and archive the tournament financial record against routine editing.
- [ ] Track outstanding payouts, disputes, tax documents, and corrective actions through resolution.
- [ ] Complete required accounting and tax reporting on the approved schedule.

## 14. Ongoing Operations & Maintenance

- [ ] Review this checklist before every tournament and after every material operational change.
- [ ] Assign owners and due dates to incomplete recurring tasks.
- [ ] Review vendor access and remove access no longer required.
- [ ] Review account recovery methods and emergency contacts quarterly.
- [ ] Review domain, hosting, email, Square, WeighFish, weather, insurance, and permit renewal dates monthly.
- [ ] Inspect, update, charge, and test hardware before every tournament.
- [ ] Restock and inspect the registration kit before every tournament.
- [ ] Verify tournament data, public information, communication templates, and staff contacts before every event.
- [ ] Back up and securely retain official exports, financial evidence, and operational records.
- [ ] Review Square deposits, disputes, and account notices on the approved schedule.
- [ ] Review WeighFish and Square product or policy changes that could affect operations.
- [ ] Conduct periodic staff refreshers and disaster-recovery drills.
- [ ] Record incidents, lessons learned, and corrective actions after each tournament.
- [ ] Update authoritative procedures when an approved business rule changes.
- [ ] Update this checklist whenever a new non-development readiness task is identified.
- [ ] Perform an annual operational, legal, insurance, tax, vendor, and records review.

## Future Operational Improvements

The following ideas are intentionally outside Version 1. They remain unchecked
until separately evaluated, approved, and promoted into the active operational
plan.

- [ ] Evaluate a self-service registration kiosk.
- [ ] Evaluate QR-based tournament check-in.
- [ ] Evaluate digital waivers and consent records.
- [ ] Evaluate sponsor coupons or digital promotional offers.
- [ ] Evaluate live WeighFish synchronization.
- [ ] Evaluate multiple staffed registration tables for high-volume events.
- [ ] Evaluate mobile receipt or ticket printing.
- [ ] Evaluate automated staff and angler reminder messaging.
- [ ] Evaluate accounting-system exports and reconciliation support.
- [ ] Evaluate electronic payout methods with appropriate approval controls.
- [ ] Evaluate dedicated backup tablets and cellular service from a second carrier.
- [ ] Evaluate formal seasonal equipment replacement and lifecycle planning.
