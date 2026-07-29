"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addMemberFormData,
  validateAddMemberForm,
  type AddMemberFormState,
} from "@/lib/add-member-form";
import {
  AdminMemberDataError,
  createMemberAtomically,
} from "@/lib/admin-members";
import {
  AdminAuthorizationError,
  requireAdminUser,
} from "@/lib/admin-auth";

export async function createMemberAction(
  _previousState: AddMemberFormState,
  formData: FormData,
): Promise<AddMemberFormState> {
  try {
    await requireAdminUser();
  } catch (error) {
    const message =
      error instanceof AdminAuthorizationError
        ? error.message
        : "Admin authorization could not be verified.";

    return { status: "error", message, errors: {} };
  }

  const values = addMemberFormData(formData);
  const errors = validateAddMemberForm(values);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Review the member information before saving.",
      errors,
    };
  }

  let anglerId: string;

  try {
    ({ anglerId } = await createMemberAtomically(values));
  } catch (error) {
    console.error("Admin member creation failed.", error);

    if (error instanceof AdminMemberDataError) {
      return {
        status: "error",
        message: error.message,
        errors: {},
        duplicateAnglerId: error.duplicateAnglerId,
      };
    }

    return {
      status: "error",
      message: "The member could not be saved. No records were created.",
      errors: {},
    };
  }

  revalidatePath("/admin/members");
  redirect(
    `/admin/members?saved=1&member=${encodeURIComponent(anglerId)}`,
  );
}
