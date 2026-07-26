"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  announcementFormData,
  announcementFormToInsert,
  validateAnnouncementForm,
  type AnnouncementFormState,
} from "@/lib/announcement-form";
import { createAnnouncement } from "@/lib/news";

export async function createAnnouncementAction(
  _previousState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const values = announcementFormData(formData);
  const errors = validateAnnouncementForm(values);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Review the announcement before saving.",
      errors,
    };
  }

  try {
    await createAnnouncement(announcementFormToInsert(values));
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/announcements");
  } catch (error) {
    console.error("Announcement create failed.", error);

    return {
      status: "error",
      message:
        "Changes could not be saved. Check your connection and try again.",
      errors: {},
    };
  }

  redirect("/admin/announcements?saved=1");
}
