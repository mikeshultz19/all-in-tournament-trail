"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  reopenRegistrationIdentityReview,
  resolveRegistrationIdentityReview,
} from "@/lib/registration-identity-review";

export interface RegistrationReviewActionState {
  status: "idle" | "success" | "error";
  message: string;
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
    revalidatePath("/admin/registration-review");
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
  revalidatePath("/admin/registration-review");
}
