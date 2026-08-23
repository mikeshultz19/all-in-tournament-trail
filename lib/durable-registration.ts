import "server-only";

import {
  createAuthoritativeRegistrationQuote,
  validateOnlineRegistrationRequest,
  type OnlineRegistrationRequest,
  type RegistrationPriceSnapshot,
} from "@/lib/online-registration";
import { getRegistrationMembershipReviewIssues } from "@/lib/registration-membership-validation";
import { classifyRegistrationIdentity } from "@/lib/registration-identity-review-core";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentBySlug } from "@/lib/tournaments";
import type { TournamentRegistration } from "@/types/aoy";

export type VerifiedRegistrationPayment = {
  status: "authorized";
  paymentReference: string;
  amountCents: number;
};

export class DurableRegistrationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DurableRegistrationError";
  }
}

export async function completeDurableRegistration(
  input: OnlineRegistrationRequest,
  payment: VerifiedRegistrationPayment,
): Promise<TournamentRegistration> {
  if (
    payment.status !== "authorized" ||
    !payment.paymentReference.trim() ||
    !Number.isSafeInteger(payment.amountCents) ||
    payment.amountCents <= 0
  ) {
    throw new DurableRegistrationError(
      "A verified successful payment is required.",
    );
  }

  const tournament = await getTournamentBySlug(input.tournamentSlug);
  if (!tournament?.season_id) {
    throw new DurableRegistrationError(
      "The selected tournament is not assigned to a membership season.",
    );
  }

  const publicTournament = toPublicTournament(tournament);
  const supabase = createSupabaseServerClient();
  const canonicalAnglersResult = await supabase
    .from("anglers")
    .select("*")
    .eq("is_active", true)
    .is("merged_into_angler_id", null);
  if (canonicalAnglersResult.error) {
    throw new DurableRegistrationError(
      "Registration identity could not be evaluated.",
      { cause: canonicalAnglersResult.error },
    );
  }
  const sameTournamentAnglersResult = await supabase
    .from("tournament_registrations")
    .select("angler1_id,angler2_id")
    .eq("tournament_id", tournament.id)
    .eq("registration_status", "active");
  if (sameTournamentAnglersResult.error) {
    throw new DurableRegistrationError(
      "Registration identity could not be evaluated.",
      { cause: sameTournamentAnglersResult.error },
    );
  }
  const sameTournamentAnglerIds = new Set(
    (sameTournamentAnglersResult.data ?? []).flatMap((registration) => [
      registration.angler1_id,
      registration.angler2_id,
    ]).filter((anglerId): anglerId is string => Boolean(anglerId)),
  );
  const identityClassification = classifyRegistrationIdentity(
    input.anglers,
    canonicalAnglersResult.data ?? [],
    { activeTournamentAnglerIds: sameTournamentAnglerIds },
  );
  const membershipIssues = await getRegistrationMembershipReviewIssues(
    input.anglers,
    tournament,
    Boolean(input.options.memberPot || input.options.insurance),
    new Set(
      identityClassification.participants
        .filter((participant) => participant.status === "review_required")
        .map((participant) => participant.participantPosition),
    ),
  );
  for (const issue of membershipIssues) {
    const participant = identityClassification.participants.find(
      (item) => item.participantPosition === issue.participantPosition,
    );
    if (!participant) continue;
    participant.status = "review_required";
    participant.reason = participant.reason
      ? `${participant.reason} ${issue.reason}`
      : issue.reason;
  }
  identityClassification.status = identityClassification.participants.some(
    (participant) => participant.status === "review_required",
  )
    ? "review_required"
    : "verified";
  const errors = validateOnlineRegistrationRequest(
    input,
    new Date(),
    { verifiedPaymentCompletion: true },
    publicTournament,
  );
  if (errors.length) {
    throw new DurableRegistrationError(errors.join(" "));
  }

  const quote: RegistrationPriceSnapshot =
    createAuthoritativeRegistrationQuote(
      input,
      new Date(),
      publicTournament,
      { verifiedPaymentCompletion: true },
    );

  if (quote.totalCents !== payment.amountCents) {
    throw new DurableRegistrationError(
      "The verified payment amount does not match the authoritative registration total.",
    );
  }

  const registrationRpc =
    identityClassification.status === "review_required"
      ? "complete_registration_for_identity_review"
      : "complete_durable_registration";
  const rpcArguments = {
      p_tournament_id: tournament.id,
      p_registration_type: input.registrationType,
      p_anglers: input.anglers,
      p_options: input.options,
      p_payment_reference: payment.paymentReference.trim(),
      p_rules_version: input.acknowledgment.rulesVersion,
      p_waiver_version: input.acknowledgment.waiverVersion,
      p_price_snapshot: quote,
      ...(identityClassification.status === "review_required"
        ? { p_classification: identityClassification.participants }
        : {}),
    };
  const { data, error } = await supabase.rpc(
    registrationRpc,
    rpcArguments,
  );

  if (error || !data) {
    throw new DurableRegistrationError(
      "The verified registration could not be saved. No partial registration was created.",
      { cause: error },
    );
  }

  return data as TournamentRegistration;
}
