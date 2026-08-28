"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminMemberById } from "@/lib/admin-members";
import { getMembershipForAnglerAndSeason, listMembersForSeason } from "@/lib/memberships";
import { getTournamentById } from "@/lib/tournaments";
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

function membership(value: string) {
  return value === "current" || value === "joining" || value === "non-member"
    ? value
    : null;
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
    || anglers.some((angler) => !angler.firstName || !angler.lastName || !angler.streetAddress || !angler.city || !angler.state || !angler.zipCode || !angler.email || !angler.mobilePhone || !angler.membership)
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
  let authoritativeTotalCents: number;
  try {
    authoritativeTotalCents = getWalkUpPricing({
      registrationType: registrationType as "solo" | "team",
      paymentMethod: paymentMethod as "cash" | "card" | "other",
      memberships: anglers.map((angler) =>
        angler.membership as "current" | "joining" | "non-member"
      ),
      ...options,
    }).totalCollectedCents;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error
        ? error.message
        : "Verify the walk-up pricing selections.",
      draft,
    };
  }
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
  const { error } = await createSupabaseServerClient().rpc(
    "admin_create_sequential_walkup_registration",
    {
      p_tournament_id: tournamentId,
      p_registration_type: registrationType,
      p_anglers: anglers,
      p_options: options,
      p_payment_method: paymentMethod,
      p_total_paid_cents: authoritativeTotalCents,
      p_admin_user_id: admin.id,
    },
  );

  if (error) {
    console.error("Walk-up registration save failed.", error);
    return { status: "error", message: "The walk-up registration could not be saved. Verify the identity and membership selections.", draft };
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

export async function cancelWalkUpRegistrationAction(
  tournamentId: string,
  registrationId: string,
  _previousState: RegistrationOperationsActionState,
): Promise<RegistrationOperationsActionState> {
  void _previousState;
  const admin = await requireAdminUser();
  const { error } = await createSupabaseServerClient().rpc(
    "admin_cancel_walkup_registration",
    {
      p_registration_id: registrationId,
      p_tournament_id: tournamentId,
      p_admin_user_id: admin.id,
    },
  );
  if (error) {
    console.error("Walk-up cancellation failed.", error);
    return { status: "error", message: "Only an active, unchecked walk-up can be cancelled. Reopen check-in first." };
  }

  revalidateRegistrationOperations();
  return { status: "success", message: "Walk-up cancelled. Its audit, member, and membership records were retained." };
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
