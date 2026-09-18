import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildRegistrationConfirmationEmail,
  uniqueRegistrationRecipients,
} from "@/lib/registration-confirmation-email-template";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/202608220002_add_registration_confirmation_email_outbox.sql"),
  "utf8",
).replace(/\r\n/g, "\n");
const completion = fs.readFileSync(path.join(root, "lib/online-payment-attempts.ts"), "utf8");
const delivery = fs.readFileSync(path.join(root, "lib/registration-confirmation-email.ts"), "utf8");
const walkUpMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/202609170001_add_walkup_confirmation_email_delivery.sql"),
  "utf8",
);
const registrationActions = fs.readFileSync(path.join(root, "app/admin/registration-review/actions.ts"), "utf8");
const attendanceActions = fs.readFileSync(path.join(root, "app/admin/tournament-manager/prepare/check-in-actions.ts"), "utf8");
const identityReview = fs.readFileSync(path.join(root, "lib/registration-identity-review.ts"), "utf8");

describe("registration confirmation email outbox", () => {
  it("normalizes and deduplicates Team recipients while retaining one Solo recipient", () => {
    expect(uniqueRegistrationRecipients([" Angler@Example.com ", "angler@example.com", "partner@example.com"])).toEqual(["angler@example.com", "partner@example.com"]);
    expect(uniqueRegistrationRecipients(["solo@example.com"])).toEqual(["solo@example.com"]);
  });

  it("enqueues only verified completed attempts and remains unique per registration recipient", () => {
    expect(migration).toContain("new.state = 'completed'");
    expect(migration).toContain("new.square_status = 'COMPLETED'");
    expect(migration).toContain("unique (registration_id, normalized_recipient_email)");
    expect(migration).toContain("on conflict (registration_id, normalized_recipient_email) do nothing");
    expect(migration).toContain("when (new.state = 'completed' and new.registration_id is not null and new.square_status = 'COMPLETED')");
  });

  it("uses a concurrency-safe claim and deterministic provider idempotency", () => {
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain("status = 'sending'");
    expect(migration).toContain("attempt_count = attempt_count + 1");
    expect(migration).toContain("'registration-confirmation:' || new.registration_id::text || ':' || md5(v_email)");
    expect(delivery).toContain("idempotencyKey: delivery.provider_idempotency_key");
    expect(delivery).toContain("if (!delivery?.id) break");
  });

  it("routes completion, webhook recovery, and retries through the same durable delivery function", () => {
    expect(completion.match(/deliverCompletedRegistrationEmail/g)?.length).toBeGreaterThanOrEqual(5);
    expect(completion).toContain("Payment and registration remain authoritative; the durable outbox can be retried.");
    expect(delivery).toContain('attempt.state !== "completed"');
    expect(delivery).toContain('online_payment_state !== "completed"');
  });

  it("adds nullable walk-up outbox rows transactionally without weakening online payment-attempt rules", () => {
    expect(walkUpMigration).toContain("alter column payment_attempt_id drop not null");
    expect(walkUpMigration.toLowerCase()).not.toMatch(/drop constraint[^;]*payment_attempt|drop[^;]*foreign key/);
    expect(walkUpMigration).toContain("select * into v_registration");
    expect(walkUpMigration.indexOf("select * into v_registration")).toBeLessThan(walkUpMigration.indexOf("insert into public.registration_confirmation_email_deliveries"));
    expect(walkUpMigration).toContain("payment_attempt_id,");
    expect(walkUpMigration).toContain("v_registration.id,\n      null,");
    expect(walkUpMigration).toContain("on conflict (registration_id, normalized_recipient_email) do nothing");
    expect(walkUpMigration).toContain("select distinct lower(btrim(participant ->> 'email'))");
    expect(walkUpMigration).toContain("where nullif(lower(btrim(participant ->> 'email')), '') is not null");
    expect(walkUpMigration).toContain("missing-email-");
    expect(walkUpMigration).toContain("set email = null");
    expect(migration).toContain("new.id,\n        v_email,");
  });

  it("limits automatic walk-up delivery processing to successful creation", () => {
    expect(registrationActions).toContain("await deliverRegistrationConfirmationEmails(registration.id)");
    expect(attendanceActions).not.toContain("deliverRegistrationConfirmationEmails");
    expect(identityReview).not.toContain("deliverRegistrationConfirmationEmails");
    expect(walkUpMigration).not.toMatch(/create trigger|after update/i);
    expect(delivery).toContain('registration.registration_source === "walk_up"');
    expect(delivery).toContain('delivery.payment_attempt_id !== null');
    expect(delivery).toContain('throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID")');
  });

  it("renders the required content without fee breakdown or raw ISO dates", () => {
    const email = buildRegistrationConfirmationEmail({
      boatNumber: 7,
      tournamentName: "Eagle Mountain Tournament",
      tournamentDate: "2026-11-01T12:00:00+00:00",
      lake: "Eagle Mountain Lake",
      ramp: "Twin Points",
      launchType: "Numbered Takeoff",
      morningRegistration: "4:30 AM",
      safeLight: "6:45 AM",
      officialSunrise: "7:15 AM",
      scalesClose: "3:00 PM",
      anglers: ["Taylor Angler", "Jordan Angler"],
      selectedOptions: ["Tournament Entry", "Gold Pot"],
      totalCents: 12345,
    });
    expect(email.subject).toBe("AITT Registration Confirmed — Eagle Mountain Tournament");
    expect(email.html).toContain("REGISTRATION NUMBER");
    expect(email.html).not.toContain("Registration / Boat Number");
    expect(email.html).toContain("Fish Length Requirements");
    expect(email.html).toContain("Largemouth Bass: 14-inch minimum");
    expect(email.html).toContain("Smallmouth Bass: 14-inch minimum");
    expect(email.html).toContain("Spotted Bass: No minimum length");
    expect(email.html).toContain("#7");
    expect(email.html).toContain("Your registration is confirmed. Your registration number is #7. You are required to complete check-in before the tournament to receive your boat number, launch time, and stop-fishing time. Check the Announcements section of the AITT website for early check-in times and location. If you do not attend early check-in, you must check in on tournament morning.");
    expect(email.html).not.toContain("Confirmation Number");
    expect(email.html).not.toContain("AITT-ABC123");
    expect(email.html).toContain("$123.45");
    expect(email.html).toContain("November 1, 2026");
    expect(email.html).not.toContain("2026-11-01T12:00:00+00:00");
    expect(email.html).not.toContain("Processing Fee");
    expect(email.html).toContain("Estimated Launch / Safe Light");
    expect(email.html).toContain("Sunrise");
    expect(email.html).toContain("Have your boat in the water and ready to launch before this time.");
    expect(email.html).toContain("All tournament times are subject to change by the Tournament Director.");
    expect(email.html).toContain("Tournament Status");
    expect(email.html).toContain('href="https://allintrail.com"');
    expect(email.html).toContain('href="https://allintrail.com" target="_blank" rel="noopener noreferrer"');
    expect(email.html).toContain("Check AITT Homepage →");
    expect(email.html).not.toContain('href="/"');

    const unassigned = buildRegistrationConfirmationEmail({
      boatNumber: null,
      tournamentName: "Legacy Tournament",
      tournamentDate: "2026-11-01",
      lake: null,
      ramp: null,
      launchType: null,
      morningRegistration: null,
      safeLight: null,
      officialSunrise: null,
      scalesClose: null,
      anglers: ["Legacy Angler"],
      selectedOptions: ["Tournament Entry"],
      totalCents: 6000,
    });
    expect(unassigned.html).toContain("REGISTRATION NUMBER");
    expect(unassigned.html).toContain("TBA");
  });

  it("renders the tournament contact and fish-length sections for Team and Solo registrations", () => {
    const team = buildRegistrationConfirmationEmail({
      boatNumber: 12,
      tournamentName: "Team Tournament",
      tournamentDate: "2026-11-01T12:00:00+00:00",
      lake: "Lake Team",
      ramp: "Ramp Team",
      launchType: "Numbered Takeoff",
      morningRegistration: "4:30 AM",
      safeLight: "6:45 AM",
      officialSunrise: "7:15 AM",
      scalesClose: "3:00 PM",
      anglers: ["Taylor Angler", "Jordan Angler"],
      selectedOptions: ["Tournament Entry", "Gold Pot"],
      totalCents: 12345,
    });
    const solo = buildRegistrationConfirmationEmail({
      boatNumber: 8,
      tournamentName: "Solo Tournament",
      tournamentDate: "2026-11-01T12:00:00+00:00",
      lake: "Lake Solo",
      ramp: "Ramp Solo",
      launchType: "Numbered Takeoff",
      morningRegistration: "4:30 AM",
      safeLight: "6:45 AM",
      officialSunrise: "7:15 AM",
      scalesClose: "3:00 PM",
      anglers: ["Taylor Solo"],
      selectedOptions: ["Tournament Entry", "Big Bass"],
      totalCents: 6789,
    });

    for (const email of [team, solo]) {
      expect(email.html).toContain("AITT TOURNAMENT CONTACT: 817-841-9120 - PLEASE SAVE THIS NUMBER IN YOUR PHONE");
      expect(email.html).toContain("Fish Length Requirements");
      expect(email.html).toContain("Largemouth Bass: 14-inch minimum");
      expect(email.html).toContain("Smallmouth Bass: 14-inch minimum");
      expect(email.html).toContain("Spotted Bass: No minimum length");
      expect(email.html).toContain("Tournament Information");
      expect(email.html.indexOf("Tournament Information")).toBeLessThan(email.html.indexOf("AITT TOURNAMENT CONTACT"));
      expect(email.html.indexOf("AITT TOURNAMENT CONTACT")).toBeLessThan(email.html.indexOf("Registered Anglers"));
    }
  });

  it.each(["cash", "card", "other"] as const)("renders the approved walk-up variant for %s", (paymentMethod) => {
    const selectedOptions = [
      "Angler 1 Membership — $40.00",
      "Angler 2 Membership — $40.00",
      "Tournament Entry — $60.00",
      ...(paymentMethod === "card" ? ["Card Processing Fee — $4.50"] : []),
    ];
    const email = buildRegistrationConfirmationEmail({
      variant: "walk_up",
      boatNumber: 41,
      tournamentName: "FAKE Walk-Up Tournament",
      tournamentDate: "2026-11-01T12:00:00+00:00",
      lake: "Fake Lake",
      ramp: "Fake Ramp",
      launchType: "Numbered Takeoff",
      morningRegistration: "4:30 AM",
      safeLight: "6:45 AM",
      officialSunrise: "7:15 AM",
      scalesClose: "3:00 PM",
      anglers: ["Fake Angler One", "Fake Angler Two"],
      selectedOptions,
      paymentMethod,
      totalCents: paymentMethod === "card" ? 14450 : 14000,
    });
    expect(email.html).toContain("REGISTRATION NUMBER");
    expect(email.html).toContain("Your tournament-day registration is confirmed. Your registration number is #41. Please follow the launch and stop-fishing times provided by tournament staff.");
    expect(email.html).toContain(`Payment Method</td><td style="padding:6px 0;color:#111;font-size:14px;font-weight:700">${paymentMethod[0].toUpperCase()}${paymentMethod.slice(1)}`);
    expect(email.html).toContain("Angler 1 Membership — $40.00");
    expect(email.html).toContain("Angler 2 Membership — $40.00");
    expect(email.html).not.toContain("boat number");
    expect(email.html).not.toContain("random draw");
    expect(email.html).not.toContain("check in");
    expect(email.html).not.toContain("Square receipt");
    if (paymentMethod === "card") expect(email.html).toMatch(/Card Processing Fee[^$]+\$4\.50/);
    else expect(email.html).not.toContain("Processing Fee");
  });

  it("requires explicit staging environment and allowlist configuration", () => {
    expect(delivery).toContain("AITT_EMAIL_ENVIRONMENT");
    expect(delivery).toContain("AITT_STAGING_EMAIL_ALLOWLIST");
    expect(delivery).toContain("STAGING_RECIPIENT_NOT_ALLOWED");
  });
});
