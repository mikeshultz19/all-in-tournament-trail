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
);
const completion = fs.readFileSync(path.join(root, "lib/online-payment-attempts.ts"), "utf8");
const delivery = fs.readFileSync(path.join(root, "lib/registration-confirmation-email.ts"), "utf8");

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
      scalesClose: "3:00 PM",
      anglers: ["Taylor Angler", "Jordan Angler"],
      selectedOptions: ["Tournament Entry", "Gold Pot"],
      totalCents: 12345,
    });
    expect(email.subject).toBe("AITT Registration Confirmed — Eagle Mountain Tournament");
    expect(email.html).toContain("Registration / Boat Number");
    expect(email.html).toContain("Fish Length Requirements");
    expect(email.html).toContain("Largemouth Bass: 14-inch minimum");
    expect(email.html).toContain("Smallmouth Bass: 14-inch minimum");
    expect(email.html).toContain("Spotted Bass: No minimum length");
    expect(email.html).toContain("#7");
    expect(email.html).not.toContain("Confirmation Number");
    expect(email.html).not.toContain("AITT-ABC123");
    expect(email.html).toContain("$123.45");
    expect(email.html).toContain("November 1, 2026");
    expect(email.html).not.toContain("2026-11-01T12:00:00+00:00");
    expect(email.html).not.toContain("Processing Fee");
    expect(email.html).toContain("Approx. Official Safe Light");
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
      scalesClose: null,
      anglers: ["Legacy Angler"],
      selectedOptions: ["Tournament Entry"],
      totalCents: 6000,
    });
    expect(unassigned.html).toContain("Registration / Boat Number");
    expect(unassigned.html).toContain("TBA");
  });

  it("renders the fish-length section for Team and Solo registrations", () => {
    const team = buildRegistrationConfirmationEmail({
      boatNumber: 12,
      tournamentName: "Team Tournament",
      tournamentDate: "2026-11-01T12:00:00+00:00",
      lake: "Lake Team",
      ramp: "Ramp Team",
      launchType: "Numbered Takeoff",
      morningRegistration: "4:30 AM",
      safeLight: "6:45 AM",
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
      scalesClose: "3:00 PM",
      anglers: ["Taylor Solo"],
      selectedOptions: ["Tournament Entry", "Big Bass"],
      totalCents: 6789,
    });

    for (const email of [team, solo]) {
      expect(email.html).toContain("Fish Length Requirements");
      expect(email.html).toContain("Largemouth Bass: 14-inch minimum");
      expect(email.html).toContain("Smallmouth Bass: 14-inch minimum");
      expect(email.html).toContain("Spotted Bass: No minimum length");
      expect(email.html).toContain("Tournament Information");
    }
  });

  it("requires explicit staging environment and allowlist configuration", () => {
    expect(delivery).toContain("AITT_EMAIL_ENVIRONMENT");
    expect(delivery).toContain("AITT_STAGING_EMAIL_ALLOWLIST");
    expect(delivery).toContain("STAGING_RECIPIENT_NOT_ALLOWED");
  });
});
