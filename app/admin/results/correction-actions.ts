"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  correctOfficialResultHistory,
  correctOfficialResult,
  correctWorkingResult,
  reviewWorkingResultHistory,
} from "@/lib/official-results";
import {
  rebuildChampionshipQualificationForOfficialResult,
} from "@/lib/championship-qualification";
import type { OfficialParticipationStatus } from "@/lib/official-results";

export async function correctWorkingResultAction(input: {
  resultEntryId: string;
  changes: Record<string, unknown>;
  reason: string;
}): Promise<{ status: "success" | "error"; message: string }> {
  const admin = await requireAdminUser();
  try {
    await correctWorkingResult({ ...input, adminUserId: admin.id });
    revalidatePath("/admin/tournament-manager/import");
    revalidatePath("/admin/tournament-manager/publish");
    return { status: "success", message: "Working Result corrected." };
  } catch (error) {
    console.error("Working Result correction failed.", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Correction failed.",
    };
  }
}

export async function correctOfficialResultAction(input: {
  officialResultEntryId: string;
  changes: Record<string, unknown>;
  reason: string;
}): Promise<{ status: "success" | "error"; message: string }> {
  const admin = await requireAdminUser();
  try {
    await correctOfficialResult({ ...input, adminUserId: admin.id });
    await rebuildChampionshipQualificationForOfficialResult(
      input.officialResultEntryId,
      admin.id,
    );
    revalidatePath("/");
    revalidatePath("/results");
    return {
      status: "success",
      message: "Documented Official Results correction completed.",
    };
  } catch (error) {
    console.error("Official Result correction failed.", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Correction failed.",
    };
  }
}

export async function reviewWorkingResultHistoryAction(input: {
  resultEntryId: string;
  registrationId: string;
  participationStatus: OfficialParticipationStatus;
  aoyEligible: boolean;
  eligibilityReason: string;
}): Promise<{ status: "success" | "error"; message: string }> {
  const admin = await requireAdminUser();
  try {
    await reviewWorkingResultHistory({ ...input, adminUserId: admin.id });
    revalidatePath("/admin/tournament-manager/import");
    revalidatePath("/admin/tournament-manager/publish");
    return { status: "success", message: "Historical result review saved." };
  } catch (error) {
    console.error("Historical result review failed.", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Review failed.",
    };
  }
}

export async function correctOfficialResultHistoryAction(input: {
  officialResultEntryId: string;
  registrationId: string;
  participationStatus: OfficialParticipationStatus;
  aoyEligible: boolean;
  eligibilityReason: string;
  reason: string;
}): Promise<{ status: "success" | "error"; message: string }> {
  const admin = await requireAdminUser();
  try {
    await correctOfficialResultHistory({ ...input, adminUserId: admin.id });
    await rebuildChampionshipQualificationForOfficialResult(
      input.officialResultEntryId,
      admin.id,
    );
    revalidatePath("/");
    revalidatePath("/results");
    return {
      status: "success",
      message: "Historical Official Result correction completed.",
    };
  } catch (error) {
    console.error("Historical Official Result correction failed.", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Correction failed.",
    };
  }
}
