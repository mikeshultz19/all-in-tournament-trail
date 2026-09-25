import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { deliverRegistrationConfirmationEmails, revalidatePath, requireAdminUser, rpc } = vi.hoisted(() => ({
  deliverRegistrationConfirmationEmails: vi.fn(),
  revalidatePath: vi.fn(),
  requireAdminUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdminUser,
}));

vi.mock("@/lib/registration-confirmation-email", () => ({
  deliverRegistrationConfirmationEmails,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    rpc,
  }),
}));

import { createWalkUpRegistrationAction } from "@/app/admin/registration-review/actions";
import {
  getWalkUpDisplayPricing,
  getWalkUpPricing,
} from "@/lib/walk-up-registration-form";

function buildWalkUpFormData(overrides: Record<string, string | boolean>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries({
    tournamentId: "tour-1",
    registrationType: "team",
    paymentMethod: "cash",
    totalPaid: "45.00",
    memberPot: "bronze",
    bigBass: true,
    insurance: true,
    angler1FirstName: "Alex",
    angler1LastName: "Carter",
    angler1StreetAddress: "101 Lake View Rd",
    angler1City: "Austin",
    angler1State: "TX",
    angler1ZipCode: "78701",
    angler1Email: "alex.carter@example.com",
    angler1Phone: "512-555-0101",
    angler1Membership: "current",
    angler2FirstName: "Brooke",
    angler2LastName: "Diaz",
    angler2StreetAddress: "202 River Bend Dr",
    angler2City: "Austin",
    angler2State: "TX",
    angler2ZipCode: "78702",
    angler2Email: "brooke.diaz@example.com",
    angler2Phone: "512-555-0102",
    angler2Membership: "current",
    ...overrides,
  })) {
    if (typeof value === "boolean") {
      if (value) formData.set(name, "on");
      continue;
    }
    formData.set(name, value);
  }

  return formData;
}

describe("walk-up registration draft preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({ id: "admin-1" });
    deliverRegistrationConfirmationEmails.mockResolvedValue({ sent: 2, failed: 0 });
    rpc.mockReset();
  });

  it("rejects a bypassed non-member walk-up classification", async () => {
    rpc.mockResolvedValue({
      error: { message: "AITT_REGISTRATION_MEMBER_OPTION_INELIGIBLE" },
    });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        insurance: false,
        angler2Membership: "non-member",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Every angler must have an active seasonal membership or purchase the $40 seasonal membership.",
    );
    expect(result.draft).toMatchObject({
      registrationType: "team",
      paymentMethod: "cash",
      memberPot: "bronze",
      totalPaid: "45.00",
      bigBass: true,
      insurance: false,
      angler1FirstName: "Alex",
      angler1LastName: "Carter",
      angler1StreetAddress: "101 Lake View Rd",
      angler1City: "Austin",
      angler1State: "TX",
      angler1ZipCode: "78701",
      angler1Email: "alex.carter@example.com",
      angler1Phone: "512-555-0101",
      angler1Membership: "current",
      angler2FirstName: "Brooke",
      angler2LastName: "Diaz",
      angler2StreetAddress: "202 River Bend Dr",
      angler2City: "Austin",
      angler2State: "TX",
      angler2ZipCode: "78702",
      angler2Email: "brooke.diaz@example.com",
      angler2Phone: "512-555-0102",
      angler2Membership: "joining",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("accepts the corrected selection and clears draft state on success", async () => {
    rpc.mockResolvedValue({ data: { id: "walk-up-registration-1" }, error: null });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        memberPot: "",
        bigBass: true,
        insurance: false,
        totalPaid: "80.00",
      }),
    );

    expect(result).toEqual({
      status: "success",
      message: "Walk-up added to the tournament roster.",
    });
    expect(rpc).toHaveBeenCalledWith(
      "admin_create_sequential_walkup_registration",
      expect.objectContaining({
        p_total_paid_cents: 8000,
        p_options: expect.objectContaining({
          priceSnapshot: expect.objectContaining({ totalCents: 8000 }),
        }),
      }),
    );
    expect(deliverRegistrationConfirmationEmails).toHaveBeenCalledTimes(1);
    expect(deliverRegistrationConfirmationEmails).toHaveBeenCalledWith("walk-up-registration-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/registrations");
  });

  it("uses normalized deduplicated recipients for Team and Solo delivery counts", async () => {
    rpc.mockResolvedValue({ data: { id: "walk-up-registration-2" }, error: null });
    deliverRegistrationConfirmationEmails.mockResolvedValueOnce({ sent: 1, failed: 0 });
    const team = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        memberPot: "",
        bigBass: true,
        insurance: false,
        angler2Membership: "current",
        totalPaid: "80.00",
        angler1Email: " SAME@EXAMPLE.COM ",
        angler2Email: "same@example.com",
      }),
    );
    expect(team.status).toBe("success");
    expect(deliverRegistrationConfirmationEmails).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({ id: "admin-1" });
    rpc.mockResolvedValue({ data: { id: "walk-up-registration-3" }, error: null });
    deliverRegistrationConfirmationEmails.mockResolvedValue({ sent: 1, failed: 0 });
    const solo = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        registrationType: "solo",
        memberPot: "",
        bigBass: false,
        insurance: false,
        totalPaid: "60.00",
      }),
    );
    expect(solo.status).toBe("success");
    expect(deliverRegistrationConfirmationEmails).toHaveBeenCalledTimes(1);
  });

  it("saves without queue processing when no recipient email is provided", async () => {
    rpc.mockResolvedValue({ data: { id: "walk-up-registration-no-email" }, error: null });
    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        memberPot: "",
        bigBass: true,
        insurance: false,
        totalPaid: "80.00",
        angler1Email: "",
        angler2Email: "",
      }),
    );
    expect(result).toEqual({ status: "success", message: "Confirmation not sent — no email provided." });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(deliverRegistrationConfirmationEmails).not.toHaveBeenCalled();
  });

  it("preserves a successful save and reports confirmation delivery failure", async () => {
    rpc.mockResolvedValue({ data: { id: "walk-up-registration-email-failure" }, error: null });
    deliverRegistrationConfirmationEmails.mockResolvedValue({ sent: 0, failed: 2 });
    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({ memberPot: "", bigBass: true, insurance: false, totalPaid: "80.00" }),
    );
    expect(result).toEqual({ status: "success", message: "Walk-up saved. Confirmation delivery is pending retry." });
    expect(rpc).toHaveBeenCalledBefore(deliverRegistrationConfirmationEmails);
  });

  it("queues nothing when durable walk-up persistence fails", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "save failed" } });
    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({ memberPot: "", bigBass: true, insurance: false, totalPaid: "80.00" }),
    );
    expect(result.status).toBe("error");
    expect(deliverRegistrationConfirmationEmails).not.toHaveBeenCalled();
  });

  it("shows the actionable database reason when a walk-up save is rejected", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "AITT_REGISTRATION_NOT_YET_ELIGIBLE" },
    });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        registrationType: "solo",
        memberPot: "",
        bigBass: false,
        insurance: false,
        totalPaid: "60.00",
      }),
    );

    expect(result).toEqual(expect.objectContaining({
      status: "error",
      message: "The selected member is not yet eligible for this tournament.",
    }));
  });

  it("explains how to correct an invalid current-member claim", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "AITT_REGISTRATION_CURRENT_MEMBERSHIP_NOT_FOUND" },
    });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        registrationType: "solo",
        memberPot: "",
        bigBass: false,
        insurance: false,
        totalPaid: "60.00",
        angler1Membership: "current",
      }),
    );

    expect(result.message).toContain("Use Member Search or select Joining / Purchasing.");
  });

  it("rewires the walk-up form so error submissions remount with preserved defaults and success returns to blank defaults", () => {
    const controls = readFileSync(
      "components/admin/RegistrationOperationsControls.tsx",
      "utf8",
    );

    expect(controls).toContain(
      'const draft = formWasReset ? initialDraft : state.draft ?? initialDraft;',
    );
    expect(controls).toContain(
      'const formKey =',
    );
    expect(controls).toContain('state.status === "error" ? `${JSON.stringify(draft)}:${formInstance}`');
    expect(controls).toContain('setFormInstance((current) => current + 1)');
    expect(controls).toContain('setDisplayState(initialState);');
    expect(controls).toContain("key={formKey}");
    expect(controls).toContain("getWalkUpDisplayPricing");
    expect(controls).toContain('name="totalPaid"');
    expect(controls).toContain("formatCurrencyFromCents(totalCollectedCents)");
    expect(controls).toContain('aria-live="polite"');
    expect(controls).toContain("Cancel Walk-Up");
    expect(controls).toContain("onClick={closeWalkUp}");
    expect(controls).toContain("setRegistrationType(initialDraft.registrationType)");
    expect(controls).toContain("setSelectedMembers({ 1: null, 2: null })");
    expect(controls).toContain("setWalkUpOpen(false)");
    expect(controls).toContain("setFormWasReset(true)");
    expect(controls).toContain("const draft = formWasReset ? initialDraft : state.draft ?? initialDraft;");
    expect(controls).toContain("open={walkUpOpen}");
    expect(controls).toContain("onToggle={(event) => setWalkUpOpen(event.currentTarget.open)}");
    expect(controls).toContain('label="Email"');
    expect(controls).toContain("required={false}");
  });

  it("uses the shared authoritative helper for every supported walk-up charge", () => {
    const price = (values: Parameters<typeof getWalkUpPricing>[0]) =>
      getWalkUpPricing(values).totalCollectedCents;
    const base = {
      registrationType: "team" as const,
      paymentMethod: "cash" as const,
      memberships: ["current", "current"] as const,
      memberPot: null,
      bigBass: false,
      insurance: false,
    };

    expect(price({ ...base, registrationType: "solo", memberships: ["current"] })).toBe(6000);
    expect(price({ ...base, memberships: ["joining", "joining"] })).toBe(14000);
    expect(price({ ...base, memberPot: "bronze" })).toBe(10000);
    expect(price({ ...base, memberPot: "silver" })).toBe(16000);
    expect(price({ ...base, memberPot: "gold" })).toBe(56000);
    expect(price({ ...base, bigBass: true })).toBe(8000);
    expect(price({ ...base, insurance: true })).toBe(8000);
    expect(price({ ...base, memberships: ["joining", "joining"], memberPot: "gold", bigBass: true, insurance: true })).toBe(68000);
    expect(price({ ...base, registrationType: "solo", memberships: ["current"], paymentMethod: "card" })).toBe(6210);
  });

  it.each([
    ["cash", 0, 6000],
    ["other", 0, 6000],
    ["card", 210, 6210],
  ] as const)("stores method-specific fee and total values for a $60 %s walk-up", async (paymentMethod, feeCents, totalCents) => {
    rpc.mockResolvedValue({ data: { id: `walk-up-${paymentMethod}` }, error: null });
    deliverRegistrationConfirmationEmails.mockResolvedValue({ sent: 1, failed: 0 });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        registrationType: "solo",
        paymentMethod,
        memberPot: "",
        bigBass: false,
        insurance: false,
        totalPaid: (totalCents / 100).toFixed(2),
        angler1Membership: "current",
      }),
    );

    expect(result.status).toBe("success");
    expect(rpc).toHaveBeenCalledWith(
      "admin_create_sequential_walkup_registration",
      expect.objectContaining({
        p_payment_method: paymentMethod,
        p_total_paid_cents: totalCents,
        p_options: expect.objectContaining({
          priceSnapshot: {
            lineItems: [{ name: "Tournament Entry", priceCents: 6000 }],
            subtotalCents: 6000,
            cardProcessingFeeCents: feeCents,
            totalCents,
          },
        }),
      }),
    );
  });

  it.each([
    ["cash", 0, 68000],
    ["other", 0, 68000],
    ["card", 2070, 70070],
  ] as const)("calculates multi-item %s snapshots from one authoritative subtotal", (paymentMethod, feeCents, totalCents) => {
    const pricing = getWalkUpPricing({
      registrationType: "team",
      paymentMethod,
      memberships: ["joining", "joining"],
      memberPot: "gold",
      bigBass: true,
      insurance: true,
    });
    expect(pricing.subtotalCents).toBe(68000);
    expect(pricing.cardProcessingFeeCents).toBe(feeCents);
    expect(pricing.totalCents).toBe(totalCents);
    expect(pricing.totalCollectedCents).toBe(totalCents);
  });

  it("includes one and two individual membership purchases in the authoritative subtotal", () => {
    expect(getWalkUpPricing({
      registrationType: "solo",
      paymentMethod: "cash",
      memberships: ["joining"],
      memberPot: null,
      bigBass: false,
      insurance: false,
    }).subtotalCents).toBe(10000);
    expect(getWalkUpPricing({
      registrationType: "team",
      paymentMethod: "other",
      memberships: ["joining", "joining"],
      memberPot: null,
      bigBass: false,
      insurance: false,
    }).subtotalCents).toBe(14000);
  });

  it("keeps all side pots available and replaces rather than stacks bonus pots", () => {
    expect(getWalkUpDisplayPricing({
      registrationType: "team",
      paymentMethod: "cash",
      memberships: ["joining", "joining"],
      memberPot: "gold",
      bigBass: false,
      insurance: true,
    }).totalCollectedCents).toBe(66000);

    const selection = {
      registrationType: "team" as const,
      paymentMethod: "cash" as const,
      memberships: ["current", "current"] as const,
      bigBass: true,
      insurance: true,
    };
    expect(getWalkUpPricing({ ...selection, memberPot: "bronze" }).totalCollectedCents).toBe(14000);
    expect(getWalkUpPricing({ ...selection, memberPot: "gold" }).totalCollectedCents).toBe(60000);
    expect(getWalkUpPricing({ ...selection, memberPot: null }).totalCollectedCents).toBe(10000);
  });

  it("rejects a submitted display mismatch before calling the persistence RPC", async () => {
    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        memberPot: "",
        bigBass: true,
        insurance: false,
        totalPaid: "79.00",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Total Collected changed. Review the current selections and submit again.",
    );
    expect(result.draft?.totalPaid).toBe("80.00");
    expect(rpc).not.toHaveBeenCalled();
    expect(deliverRegistrationConfirmationEmails).not.toHaveBeenCalled();
  });

  it("adds an accessible close control that only collapses the walk-up panel", () => {
    const controls = readFileSync(
      "components/admin/RegistrationOperationsControls.tsx",
      "utf8",
    );

    expect(controls).toContain('aria-label="Close walk-up form"');
    expect(controls).toContain('type="button"');
    expect(controls).toContain('details.open = false;');
    expect(controls).toContain('className="absolute right-4 top-4');
    expect(controls).not.toContain('type="submit" aria-label="Close walk-up form"');
  });

  it("keeps Team Angler 1 and Angler 2 member lookup state and field prefixes independent", () => {
    const controls = readFileSync(
      "components/admin/RegistrationOperationsControls.tsx",
      "utf8",
    );
    expect(controls).toContain('key="angler-1"');
    expect(controls).toContain('key="angler-2"');
    expect(controls).toContain('const prefix = `angler${position}` as const;');
    expect(controls).toContain('name="angler1SelectedMemberId"');
    expect(controls).toContain('name="angler2SelectedMemberId"');
    expect(controls).toContain('selectedOtherMemberId');
    expect(controls).toContain('getWalkUpMemberAction(tournamentId, id)');
  });

  it("shows the Solo team-membership reminder only for Solo entries", () => {
    const controls = readFileSync(
      "components/admin/RegistrationOperationsControls.tsx",
      "utf8",
    );
    expect(controls).toContain('registrationType === "solo"');
    expect(controls).toContain("Verify this entry is not part of an existing team.");
  });
});
