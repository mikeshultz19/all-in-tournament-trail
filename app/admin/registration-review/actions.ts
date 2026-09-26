"use server";

import { revalidatePath } from "next/cache";

import { getAdminDisplayName, requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminMemberById } from "@/lib/admin-members";
import { getMembershipForAnglerAndSeason, listMembersForSeason } from "@/lib/memberships";
import { getTournamentById } from "@/lib/tournaments";
import { deliverRegistrationConfirmationEmails } from "@/lib/registration-confirmation-email";
import { uniqueRegistrationRecipients } from "@/lib/registration-confirmation-email-template";
import {
  createWalkUpRegistrationDraft,
  getWalkUpPricing,
  type WalkUpRegistrationDraft,
} from "@/lib/walk-up-registration-form";
import {
  reopenRegistrationIdentityReview,
  resolveRegistrationContactReview,
  resolveHistoricalMembershipReview,
  resolveRegistrationIdentityReview,
} from "@/lib/registration-identity-review";

export interface RegistrationReviewActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface RegistrationOperationsActionState {
  status: "idle" | "success" | "error";
  message: string;
  draft?: WalkUpRegistrationDraft;
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateCanonicalMemberContactAction(
  _previousState: RegistrationReviewActionState,
  formData: FormData,
): Promise<RegistrationReviewActionState> {
  void _previousState;
  await requireAdminUser();
  const memberId = text(formData, "memberId");
  const firstName = text(formData, "firstName").replace(/\s+/g, " ");
  const lastName = text(formData, "lastName").replace(/\s+/g, " ");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const streetAddress = text(formData, "streetAddress");
  const city = text(formData, "city");
  const state = text(formData, "state").toUpperCase();
  const zipCode = text(formData, "zipCode");

  if (!memberId || !firstName || !lastName || !streetAddress || !city || !state || !zipCode || !phone) {
    return { status: "error", message: "Complete the required member contact fields." };
  }
  if (state.length !== 2 || (email && !EMAIL_PATTERN.test(email))) {
    return { status: "error", message: "Enter a valid state and email address." };
  }

  const { data, error } = await createSupabaseServerClient()
    .from("anglers")
    .update({
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      normalized_name: `${firstName} ${lastName}`.toLowerCase().replace(/\s+/g, " "),
      email: email || null,
      phone,
      street_address: streetAddress,
      city,
      state,
      zip_code: zipCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("is_active", true)
    .is("merged_into_angler_id", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Canonical member contact update failed.", error);
    return { status: "error", message: "The member could not be updated. Verify the selected member and try again." };
  }
  revalidateRegistrationOperations();
  return { status: "success", message: "Member contact updated. Review the registration again to clear any remaining mismatch." };
}

function purchasedMembershipIds(snapshot: unknown, priceSnapshot: unknown) {
  const lineItems = Array.isArray((priceSnapshot as { lineItems?: unknown[] } | null)?.lineItems)
    ? (priceSnapshot as { lineItems: Array<{ code?: string; name?: string }> }).lineItems
    : [];
  const purchasedCount = lineItems.filter((item) => item.code === "annual_membership" || item.name?.endsWith(" Membership")).length;
  if (!purchasedCount || !Array.isArray(snapshot)) return [];
  const snapshots = snapshot.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const membership = item as { submittedClassification?: unknown; resolvedClassification?: unknown };
    return membership.submittedClassification === "joining" || membership.resolvedClassification === "joining";
  });
  const selectedSnapshots = snapshots.length ? snapshots : snapshot.slice(0, purchasedCount);
  return selectedSnapshots
    .map((item) => (item && typeof item === "object" ? (item as { membershipId?: unknown }).membershipId : null))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

function membership(value: string) {
  return value === "current" || value === "joining" || value === "non-member"
    ? value
    : null;
}

function walkUpSaveErrorMessage(error: { message?: string } | null) {
  const code = error?.message?.match(/AITT_[A-Z0-9_]+/)?.[0];
  const messages: Record<string, string> = {
    AITT_REGISTRATION_CURRENT_MEMBERSHIP_NOT_FOUND:
      "This angler is marked Current Member, but no active membership was found for this season. Use Member Search or select Joining / Purchasing.",
    AITT_REGISTRATION_NOT_YET_ELIGIBLE:
      "The selected member is not yet eligible for this tournament.",
    AITT_REGISTRATION_MEMBER_OPTION_INELIGIBLE:
      "One angler's membership selection is not eligible for this walk-up.",
    AITT_REGISTRATION_DUPLICATE_ANGLER:
      "The same member cannot be entered twice in one registration.",
    AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED:
      "This identity matches more than one member record. Resolve the member record before saving the walk-up.",
    AITT_WALKUP_MEMBER_EMAIL_REQUIRED:
      "An email address is required for an angler marked Joining / Purchasing.",
    AITT_WALKUP_EMAIL_REQUIRED:
      "A new member needs an email address before this walk-up can be saved.",
    AITT_WALKUP_PRICE_SNAPSHOT_INVALID:
      "The walk-up total changed before saving. Review the selections and try again.",
    AITT_WALKUP_REGISTRATION_NOT_FOUND:
      "The walk-up was not saved because its registration record could not be finalized.",
  };
  return (code && messages[code])
    || "The walk-up registration could not be saved. Verify the identity and membership selections.";
}

export type WalkUpMemberSearchResult = {
  anglerId: string;
  displayName: string;
  emailHint: string;
  phoneHint: string;
  membershipStatus: string;
};

function maskEmail(value: string | null) {
  if (!value) return "No email";
  const [local, domain] = value.split("@", 2);
  return `${(local?.[0] ?? "*")}***@${domain ?? ""}`;
}

function maskPhone(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 4 ? `***-***-${digits.slice(-4)}` : "No phone";
}

export async function searchWalkUpMembersAction(
  tournamentId: string,
  query: string,
): Promise<WalkUpMemberSearchResult[]> {
  await requireAdminUser();
  const term = query.trim();
  if (term.length < 2) return [];
  const tournament = await getTournamentById(tournamentId);
  if (!tournament?.season_id) return [];
  const result = await listMembersForSeason(tournament.season_id, {
    search: term,
    active: true,
    page: 1,
    pageSize: 10,
  });
  return result.members.map((member) => ({
    anglerId: member.angler_id,
    displayName: member.display_name,
    emailHint: maskEmail(member.email),
    phoneHint: maskPhone(member.phone),
    membershipStatus: member.membership_status,
  }));
}

export async function getWalkUpMemberAction(tournamentId: string, anglerId: string) {
  await requireAdminUser();
  const member = await getAdminMemberById(anglerId);
  if (!member) return null;
  const tournament = await getTournamentById(tournamentId);
  const membershipRecord = tournament?.season_id
    ? await getMembershipForAnglerAndSeason(member.id, tournament.season_id)
    : null;
  return {
    anglerId: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    streetAddress: member.streetAddress,
    city: member.city,
    state: member.state,
    zipCode: member.zipCode,
    email: member.email,
    phone: member.phone,
    membershipStatus: membershipRecord?.status ?? null,
  };
}

function revalidateRegistrationOperations() {
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/registration-review");
  revalidatePath("/admin/tournament-manager");
  revalidatePath("/admin/tournament-manager/prepare");
  revalidatePath("/registrations");
}

export async function createWalkUpRegistrationAction(
  _previousState: RegistrationOperationsActionState,
  formData: FormData,
): Promise<RegistrationOperationsActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const draft = createWalkUpRegistrationDraft(formData);
  const tournamentId = text(formData, "tournamentId");
  const registrationType = text(formData, "registrationType");
  const submittedTotalPaid = Number(text(formData, "totalPaid"));
  const paymentMethod = text(formData, "paymentMethod");
  const angler1Membership = membership(text(formData, "angler1Membership"));
  const angler2Membership = membership(text(formData, "angler2Membership"));
  const selectedMemberIds = [
    text(formData, "angler1SelectedMemberId") || null,
    registrationType === "team" ? (text(formData, "angler2SelectedMemberId") || null) : null,
  ];

  const anglers = [
    {
      firstName: text(formData, "angler1FirstName"),
      lastName: text(formData, "angler1LastName"),
      email: text(formData, "angler1Email").toLowerCase(),
      mobilePhone: text(formData, "angler1Phone"),
      streetAddress: text(formData, "angler1StreetAddress"),
      city: text(formData, "angler1City"),
      state: text(formData, "angler1State").toUpperCase(),
      zipCode: text(formData, "angler1ZipCode"),
      membership: angler1Membership,
    },
    ...(registrationType === "team"
      ? [{
          firstName: text(formData, "angler2FirstName"),
          lastName: text(formData, "angler2LastName"),
          email: text(formData, "angler2Email").toLowerCase(),
          mobilePhone: text(formData, "angler2Phone"),
          streetAddress: text(formData, "angler2StreetAddress"),
          city: text(formData, "angler2City"),
          state: text(formData, "angler2State").toUpperCase(),
          zipCode: text(formData, "angler2ZipCode"),
          membership: angler2Membership,
        }]
      : []),
  ];

  if (
    !tournamentId || !["solo", "team"].includes(registrationType)
    || !Number.isFinite(submittedTotalPaid) || submittedTotalPaid < 0
    || !["cash", "card", "other"].includes(paymentMethod)
    || anglers.some((angler) => !angler.firstName || !angler.lastName || !angler.streetAddress || !angler.city || !angler.state || !angler.zipCode || !angler.mobilePhone || !angler.membership)
  ) {
    return { status: "error", message: "Complete all required walk-up registration fields.", draft };
  }

  const selectedIds = selectedMemberIds.filter((id): id is string => Boolean(id));
  if (new Set(selectedIds).size !== selectedIds.length) {
    return { status: "error", message: "Select two different members for a Team entry.", draft };
  }
  for (const selectedId of selectedIds) {
    const selected = await getAdminMemberById(selectedId);
    if (!selected || !selected.active || selected.mergedIntoAnglerId) {
      return { status: "error", message: "The selected member is no longer active. Search again.", draft };
    }
  }

  const memberPotValue = text(formData, "memberPot");
  const memberPot = ["bronze", "silver", "gold"].includes(memberPotValue)
    ? memberPotValue as "bronze" | "silver" | "gold"
    : null;
  const options = {
    bigBass: formData.get("bigBass") === "on",
    memberPot,
    insurance: formData.get("insurance") === "on",
  };
  let authoritativePricing: ReturnType<typeof getWalkUpPricing>;
  try {
    authoritativePricing = getWalkUpPricing({
      registrationType: registrationType as "solo" | "team",
      paymentMethod: paymentMethod as "cash" | "card" | "other",
      memberships: anglers.map((angler) =>
        angler.membership as "current" | "joining" | "non-member"
      ),
      ...options,
    });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error
        ? error.message
        : "Verify the walk-up pricing selections.",
      draft,
    };
  }
  const authoritativeTotalCents = authoritativePricing.totalCollectedCents;
  const submittedTotalCents = Math.round(submittedTotalPaid * 100);
  if (submittedTotalCents !== authoritativeTotalCents) {
    return {
      status: "error",
      message: "Total Collected changed. Review the current selections and submit again.",
      draft: {
        ...draft,
        totalPaid: (authoritativeTotalCents / 100).toFixed(2),
      },
    };
  }
  const { data: registration, error } = await createSupabaseServerClient().rpc(
    "admin_create_sequential_walkup_registration",
    {
      p_tournament_id: tournamentId,
      p_registration_type: registrationType,
      p_anglers: anglers,
      p_options: {
        ...options,
        priceSnapshot: {
          lineItems: authoritativePricing.lineItems,
          subtotalCents: authoritativePricing.subtotalCents,
          cardProcessingFeeCents: authoritativePricing.cardProcessingFeeCents,
          totalCents: authoritativeTotalCents,
        },
      },
      p_payment_method: paymentMethod,
      p_total_paid_cents: authoritativeTotalCents,
      p_admin_user_id: admin.id,
    },
  );

  if (error) {
    console.error("Walk-up registration save failed.", error);
    return { status: "error", message: walkUpSaveErrorMessage(error), draft };
  }

  const recipients = uniqueRegistrationRecipients(anglers.map((angler) => angler.email));
  if (!recipients.length) {
    revalidateRegistrationOperations();
    return { status: "success", message: "Confirmation not sent — no email provided." };
  }

  if (!registration?.id) {
    revalidateRegistrationOperations();
    return { status: "success", message: "Walk-up saved. Confirmation delivery is pending retry." };
  }

  try {
    const delivery = await deliverRegistrationConfirmationEmails(registration.id);
    if (delivery.failed > 0 || delivery.sent !== recipients.length) {
      revalidateRegistrationOperations();
      return { status: "success", message: "Walk-up saved. Confirmation delivery is pending retry." };
    }
  } catch (deliveryError) {
    console.error("Walk-up registration confirmation email processing is awaiting retry.", deliveryError);
    revalidateRegistrationOperations();
    return { status: "success", message: "Walk-up saved. Confirmation delivery is pending retry." };
  }

  revalidateRegistrationOperations();
  return { status: "success", message: "Walk-up added to the tournament roster." };
}

export async function updateRegistrationOperationsAction(
  tournamentId: string,
  registrationId: string,
  _previousState: RegistrationOperationsActionState,
  formData: FormData,
): Promise<RegistrationOperationsActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const boatNumber = Number(text(formData, "boatNumber"));
  const memberPotValue = text(formData, "memberPot");
  if (!Number.isSafeInteger(boatNumber) || boatNumber <= 0) {
    return { status: "error", message: "Enter a valid boat number." };
  }

  const { error } = await createSupabaseServerClient().rpc(
    "admin_update_registration_operations",
    {
      p_registration_id: registrationId,
      p_tournament_id: tournamentId,
      p_boat_number: boatNumber,
      p_big_bass: formData.get("bigBass") === "on",
      p_member_pot: ["bronze", "silver", "gold"].includes(memberPotValue) ? memberPotValue : null,
      p_insurance: formData.get("insurance") === "on",
      p_admin_user_id: admin.id,
    },
  );
  if (error) {
    console.error("Registration operations update failed.", error);
    return { status: "error", message: "Reopen this registration before making corrections." };
  }

  revalidateRegistrationOperations();
  return { status: "success", message: "Registration details updated." };
}

export async function cancelRegistrationAction(
  tournamentId: string,
  registrationId: string,
  _previousState: RegistrationOperationsActionState,
  formData: FormData,
): Promise<RegistrationOperationsActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const note = text(formData, "cancellationNote");
  const manualRefundStatus = text(formData, "manualRefundStatus");
  if (note.length < 3 || note.length > 500) {
    return { status: "error", message: "Enter a cancellation note between 3 and 500 characters." };
  }
  if (manualRefundStatus !== "pending" && manualRefundStatus !== "completed") {
    return { status: "error", message: "Record whether the full manual refund is pending or completed." };
  }

  const supabase = createSupabaseServerClient();
  const current = await supabase
    .from("tournament_registrations")
    .select("id,registration_key,admin_notes,registration_status,payment_reference,price_snapshot,membership_snapshot,angler1_name,angler2_name")
    .eq("id", registrationId)
    .eq("tournament_id", tournamentId)
    .maybeSingle();
  if (current.error || !current.data || current.data.registration_status !== "active") {
    return { status: "error", message: "This registration is no longer active." };
  }

  const registration = current.data as {
    id: string;
    registration_key: string;
    admin_notes: string | null;
    registration_status: string;
    payment_reference: string | null;
    price_snapshot: unknown;
    membership_snapshot: unknown;
    angler1_name: string;
    angler2_name: string | null;
  };
  const membershipIds = purchasedMembershipIds(registration.membership_snapshot, registration.price_snapshot);
  const membershipsToRevoke = membershipIds.length
    ? await supabase
      .from("memberships")
      .select("id,status,payment_reference")
      .in("id", membershipIds)
      .eq("payment_reference", registration.payment_reference)
    : { data: [], error: null };
  if (membershipsToRevoke.error || (membershipsToRevoke.data ?? []).length !== membershipIds.length) {
    return { status: "error", message: "Purchased memberships could not be verified. No cancellation was recorded." };
  }
  if ((membershipsToRevoke.data ?? []).some((membershipRecord) => membershipRecord.status !== "active")) {
    return { status: "error", message: "A purchased membership is no longer active. Review the registration before cancelling." };
  }

  const revokedLabels = membershipIds.map((id, index) => `${index === 0 ? registration.angler1_name : registration.angler2_name ?? `Angler ${index + 1}`} (${id})`);
  if (membershipIds.length) {
    const membershipUpdate = await supabase
      .from("memberships")
      .update({
        status: "cancelled",
        admin_notes: `Membership revoked with cancelled registration ${registration.registration_key} by ${getAdminDisplayName(admin)} (${admin.id}).`,
        updated_at: new Date().toISOString(),
      })
      .in("id", membershipIds)
      .eq("status", "active")
      .eq("payment_reference", registration.payment_reference);
    if (membershipUpdate.error) {
      return { status: "error", message: "Purchased memberships could not be revoked. No cancellation was recorded." };
    }
  }

  const adminNotes = [
    registration.admin_notes,
    `Cancellation reason: ${note}`,
    `Manual refund status: ${manualRefundStatus}`,
    `Cancellation admin: ${getAdminDisplayName(admin)} (${admin.id})`,
    `Memberships revoked through cancellation: ${revokedLabels.length ? revokedLabels.join(", ") : "None"}`,
  ].filter(Boolean).join("\n");
  const result = await supabase
    .from("tournament_registrations")
    .update({
      registration_status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by_admin_id: admin.id,
      admin_notes: adminNotes,
    })
    .eq("id", registrationId)
    .eq("tournament_id", tournamentId)
    .eq("registration_status", "active")
    .select("id")
    .maybeSingle();
  if (result.error || !result.data) {
    if (membershipIds.length) {
      await supabase
        .from("memberships")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .in("id", membershipIds)
        .eq("payment_reference", registration.payment_reference);
    }
    return { status: "error", message: "This registration could not be cancelled. Refresh and try again." };
  }

  revalidateRegistrationOperations();
  return { status: "success", message: "Registration cancelled. Any refund must be handled separately." };
}

export async function resolveRegistrationContactReviewAction(
  _previousState: RegistrationReviewActionState,
  formData: FormData,
): Promise<RegistrationReviewActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const reviewId = text(formData, "reviewId");
  const decision = text(formData, "decision");
  const reviewNote = text(formData, "reviewNote") || null;
  if (
    !reviewId ||
    (decision !== "approve" && decision !== "keep" && decision !== "different")
  ) {
    return { status: "error", message: "Select a valid contact review action." };
  }
  try {
    if (decision === "different") {
      await resolveRegistrationIdentityReview({
        reviewId,
        resolution: "new",
        existingAnglerId: null,
        adminUserId: admin.id,
        reviewNote,
      });
    } else {
      await resolveRegistrationContactReview({
        reviewId,
        approve: decision === "approve",
        adminUserId: admin.id,
        reviewNote,
      });
    }
    revalidateRegistrationOperations();
    return {
      status: "success",
      message:
        decision === "approve"
          ? "Member contact information updated."
          : decision === "keep"
            ? "Existing member information retained."
            : "Different person approved as a new angler.",
    };
  } catch (error) {
    console.error("Registration contact review failed.", error);
    return { status: "error", message: "The member contact review could not be resolved." };
  }
}

export async function resolveHistoricalMembershipReviewAction(_previousState: RegistrationReviewActionState, formData: FormData): Promise<RegistrationReviewActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const reviewId = text(formData, "reviewId");
  const selectedMembership = membership(text(formData, "membership"));
  const reviewNote = text(formData, "reviewNote");
  if (!reviewId || !selectedMembership || !reviewNote) return { status: "error", message: "Select the verified choice and record the source checked." };
  try {
    await resolveHistoricalMembershipReview({ reviewId, membership: selectedMembership, adminUserId: admin.id, reviewNote });
    revalidateRegistrationOperations();
    return { status: "success", message: "Historical membership selection confirmed." };
  } catch (error) {
    console.error("Historical membership review failed.", error);
    return { status: "error", message: "The historical membership review could not be resolved." };
  }
}

export async function markMembershipCollectedAction(_previousState: RegistrationOperationsActionState, formData: FormData): Promise<RegistrationOperationsActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const reviewId = text(formData, "reviewId");
  if (!reviewId) return { status: "error", message: "Select a membership due." };
  try {
    await resolveHistoricalMembershipReview({
      reviewId,
      membership: "joining",
      adminUserId: admin.id,
      reviewNote: `Manual $40 membership collected at check-in by ${getAdminDisplayName(admin)} (${admin.id}).`,
    });
    revalidateRegistrationOperations();
    return { status: "success", message: "Membership collected and confirmed." };
  } catch (error) {
    console.error("Membership due confirmation failed.", error);
    return { status: "error", message: "The membership due could not be confirmed." };
  }
}

export async function resolveRegistrationReviewAction(
  _previousState: RegistrationReviewActionState,
  formData: FormData,
): Promise<RegistrationReviewActionState> {
  const admin = await requireAdminUser();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const resolution = String(formData.get("resolution") ?? "");
  const existingAnglerId =
    String(formData.get("existingAnglerId") ?? "").trim() || null;
  const reviewNote =
    String(formData.get("reviewNote") ?? "").trim() || null;

  if (
    !reviewId ||
    (resolution !== "existing" && resolution !== "new") ||
    (resolution === "existing" && !existingAnglerId)
  ) {
    return {
      status: "error",
      message: "Select a valid identity resolution.",
    };
  }

  try {
    await resolveRegistrationIdentityReview({
      reviewId,
      resolution,
      existingAnglerId,
      adminUserId: admin.id,
      reviewNote,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/members");
    revalidatePath("/admin/registration-review");
    revalidatePath("/admin/tournament-manager/prepare");
    revalidatePath("/registrations");
    return { status: "success", message: "Registration identity resolved." };
  } catch (error) {
    console.error("Registration identity resolution failed.", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The registration identity could not be resolved.",
    };
  }
}

export async function reopenRegistrationReviewAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const reviewNote =
    String(formData.get("reviewNote") ?? "").trim() || null;
  if (!reviewId) return;

  await reopenRegistrationIdentityReview({
    reviewId,
    adminUserId: admin.id,
    reviewNote,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/registration-review");
  revalidatePath("/admin/tournament-manager/prepare");
}
