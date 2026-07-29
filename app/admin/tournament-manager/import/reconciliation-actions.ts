"use server";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  createAndResolveImportedIdentity,
  resolveImportedIdentity,
  resolveSourceIdentity,
} from "@/lib/identity-reconciliation";
import type { CompetitiveRecordType } from "@/types/aoy";

export type ReconciliationActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function confirmSourceIdentityAction(input: {
  sourceIdentityId: string;
  anglerId: string;
  reassignment?: boolean;
}): Promise<ReconciliationActionResult> {
  const admin = await requireAdminUser();

  try {
    await resolveSourceIdentity(
      input.sourceIdentityId,
      "confirmed",
      input.anglerId,
      admin.id,
      input.reassignment
        ? "admin_reassignment"
        : "admin_confirmation",
    );
    return { status: "success", message: "Angler identity confirmed." };
  } catch (error) {
    console.error("Source identity confirmation failed.", error);
    return {
      status: "error",
      message: "The Angler identity could not be confirmed.",
    };
  }
}

export async function rejectSourceIdentityAction(input: {
  sourceIdentityId: string;
}): Promise<ReconciliationActionResult> {
  const admin = await requireAdminUser();

  try {
    await resolveSourceIdentity(
      input.sourceIdentityId,
      "rejected",
      null,
      admin.id,
      "admin_rejection",
    );
    return { status: "success", message: "Identity suggestion rejected." };
  } catch (error) {
    console.error("Source identity rejection failed.", error);
    return {
      status: "error",
      message: "The identity suggestion could not be rejected.",
    };
  }
}

export async function confirmImportedCompetitiveIdentityAction(input: {
  importedIdentityId: string;
  competitiveRecordId: string;
  registrationId?: string | null;
  reassignment?: boolean;
}): Promise<ReconciliationActionResult> {
  const admin = await requireAdminUser();

  try {
    await resolveImportedIdentity(
      input.importedIdentityId,
      "confirmed",
      input.competitiveRecordId,
      input.registrationId ?? null,
      admin.id,
      input.registrationId
        ? "registration"
        : input.reassignment
          ? "admin_reassignment"
          : "admin_confirmation",
    );
    return {
      status: "success",
      message: "Competitive Record identity confirmed.",
    };
  } catch (error) {
    console.error("Competitive Record identity confirmation failed.", error);
    return {
      status: "error",
      message: "The Competitive Record identity could not be confirmed.",
    };
  }
}

export async function createCompetitiveRecordForImportAction(input: {
  importedIdentityId: string;
  seasonId: string;
  recordType: CompetitiveRecordType;
  anglerIds: string[];
  displayName?: string | null;
}): Promise<ReconciliationActionResult> {
  const admin = await requireAdminUser();

  try {
    await createAndResolveImportedIdentity({
      ...input,
      adminUserId: admin.id,
    });
    return {
      status: "success",
      message: "Competitive Record created and identity confirmed.",
    };
  } catch (error) {
    console.error("Competitive Record creation for import failed.", error);
    return {
      status: "error",
      message: "The Competitive Record could not be created.",
    };
  }
}

export async function rejectImportedCompetitiveIdentityAction(input: {
  importedIdentityId: string;
}): Promise<ReconciliationActionResult> {
  const admin = await requireAdminUser();

  try {
    await resolveImportedIdentity(
      input.importedIdentityId,
      "rejected",
      null,
      null,
      admin.id,
      "admin_rejection",
    );
    return {
      status: "success",
      message: "Competitive Record suggestion rejected.",
    };
  } catch (error) {
    console.error("Competitive Record identity rejection failed.", error);
    return {
      status: "error",
      message: "The Competitive Record suggestion could not be rejected.",
    };
  }
}
