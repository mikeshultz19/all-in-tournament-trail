import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, requireAdminUser, rpc } = vi.hoisted(() => ({
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
    angler2Membership: "non-member",
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
    rpc.mockReset();
  });

  it("preserves the submitted walk-up draft when the member-only pot combination is rejected", async () => {
    rpc.mockResolvedValue({
      error: { message: "AITT_REGISTRATION_MEMBER_OPTION_INELIGIBLE" },
    });

    const result = await createWalkUpRegistrationAction(
      { status: "idle", message: "" },
      buildWalkUpFormData({
        insurance: false,
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Both anglers must be current members to enter Bronze, Silver, Gold, or the Insurance Pot.",
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
      angler2Membership: "non-member",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("accepts the corrected selection and clears draft state on success", async () => {
    rpc.mockResolvedValue({ error: null });

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
      expect.objectContaining({ p_total_paid_cents: 8000 }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/registrations");
  });

  it("rewires the walk-up form so error submissions remount with preserved defaults and success returns to blank defaults", () => {
    const controls = readFileSync(
      "components/admin/RegistrationOperationsControls.tsx",
      "utf8",
    );

    expect(controls).toContain(
      'const draft = state.draft ?? initialDraft;',
    );
    expect(controls).toContain(
      'const formKey =',
    );
    expect(controls).toContain(
      'state.status === "error" ? JSON.stringify(draft) : "walk-up-form-default"',
    );
    expect(controls).toContain("key={formKey}");
    expect(controls).toContain("getWalkUpDisplayPricing");
    expect(controls).toContain('name="totalPaid"');
    expect(controls).toContain("formatCurrencyFromCents(totalCollectedCents)");
    expect(controls).toContain('aria-live="polite"');
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

  it("drops disabled member-only selections and replaces rather than stacks pots", () => {
    expect(getWalkUpDisplayPricing({
      registrationType: "team",
      paymentMethod: "cash",
      memberships: ["joining", "non-member"],
      memberPot: "gold",
      bigBass: false,
      insurance: true,
    }).totalCollectedCents).toBe(10000);

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
});
