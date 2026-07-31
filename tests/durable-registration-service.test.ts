import { beforeEach, describe, expect, it, vi } from "vitest";

import { databaseTournament } from "@/tests/tournament-db-fixture";

const { rpc, from, validateMembershipClaims } = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        is: vi.fn(async () => ({ data: [], error: null })),
      })),
    })),
  })),
  validateMembershipClaims: vi.fn(async () => [] as string[]),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({ rpc, from }),
}));

vi.mock("@/lib/tournaments", () => ({
  getTournamentBySlug: vi.fn(async () => ({
    ...databaseTournament,
    season_id: "22222222-2222-4222-8222-222222222222",
  })),
}));

vi.mock("@/lib/registration-membership-validation", () => ({
  validateRegistrationMembershipClaims: validateMembershipClaims,
}));

vi.mock("@/config/launch-mode", () => ({
  SOFT_LAUNCH_REGISTRATION_CLOSED: false,
}));

import {
  completeDurableRegistration,
  DurableRegistrationError,
} from "@/lib/durable-registration";
import {
  REGISTRATION_POLICY_VERSIONS,
  createAuthoritativeRegistrationQuote,
  type OnlineRegistrationRequest,
} from "@/lib/online-registration";
import { toPublicTournament } from "@/lib/tournament-record-adapter";

const request: OnlineRegistrationRequest = {
  tournamentSlug: databaseTournament.slug,
  registrationType: "solo",
  anglers: [
    {
      firstName: "Taylor",
      lastName: "Angler",
      email: "taylor@example.com",
      mobilePhone: "817-555-0100",
      streetAddress: "100 Lake Road",
      city: "Azle",
      state: "TX",
      zipCode: "76020",
      membership: "non-member",
    },
  ],
  options: {
    bigBass: false,
    insurance: false,
    memberPot: null,
  },
  acknowledgment: {
    rulesVersion: REGISTRATION_POLICY_VERSIONS.rules,
    waiverVersion: REGISTRATION_POLICY_VERSIONS.liability_waiver,
    acknowledgedAt: "2026-07-29T12:00:00.000Z",
    acknowledgmentAccepted: true,
  },
};

describe("completeDurableRegistration", () => {
  beforeEach(() => {
    rpc.mockReset();
    from.mockClear();
    validateMembershipClaims.mockClear();
  });

  it("rejects an unverified or mismatched payment before writing", async () => {
    await expect(
      completeDurableRegistration(request, {
        status: "authorized",
        paymentReference: "square-payment-1",
        amountCents: 1,
      }),
    ).rejects.toThrow(
      "verified payment amount does not match",
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("passes a verified payment to the single transactional RPC", async () => {
    rpc.mockResolvedValue({
      data: { id: "33333333-3333-4333-8333-333333333333" },
      error: null,
    });

    const registration = await completeDurableRegistration(request, {
      status: "authorized",
      paymentReference: "square-payment-1",
      amountCents: 6180,
    });

    expect(registration.id).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(validateMembershipClaims).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith(
      "complete_durable_registration",
      expect.objectContaining({
        p_payment_reference: "square-payment-1",
        p_registration_type: "solo",
      }),
    );
  });

  it("passes both stable participants for a Team registration", async () => {
    rpc.mockResolvedValue({
      data: { id: "44444444-4444-4444-8444-444444444444" },
      error: null,
    });
    const teamRequest: OnlineRegistrationRequest = {
      ...request,
      registrationType: "team",
      anglers: [
        request.anglers[0],
        {
          ...request.anglers[0],
          firstName: "Jordan",
          email: "jordan@example.com",
          mobilePhone: "817-555-0101",
        },
      ],
    };

    await completeDurableRegistration(teamRequest, {
      status: "authorized",
      paymentReference: "square-team-payment-1",
      amountCents: 6180,
    });

    expect(rpc).toHaveBeenCalledWith(
      "complete_durable_registration",
      expect.objectContaining({
        p_registration_type: "team",
        p_anglers: teamRequest.anglers,
      }),
    );
  });

  it("reports an atomic failure without returning a partial registration", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "transaction rolled back" },
    });

    await expect(
      completeDurableRegistration(request, {
        status: "authorized",
        paymentReference: "square-payment-2",
        amountCents: 6180,
      }),
    ).rejects.toBeInstanceOf(DurableRegistrationError);
  });

  it("keeps authoritative pricing available for verified completion after the window closes", () => {
    const closedTournament = {
      ...databaseTournament,
      season_id: "22222222-2222-4222-8222-222222222222",
      registration_closes: "2026-01-01T00:00:00.000Z",
    };
    const quote = createAuthoritativeRegistrationQuote(
      request,
      new Date("2026-07-29T12:00:00.000Z"),
      toPublicTournament(closedTournament),
      { verifiedPaymentCompletion: true },
    );

    expect(quote.totalCents).toBe(6180);
  });
});
