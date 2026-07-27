"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  announcementFormData,
  validateAnnouncementForm,
  type AnnouncementFormState,
} from "@/lib/announcement-form";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/news";

function refreshAnnouncementPages(id: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${id}/edit`);
}

export async function updateAnnouncementAction(
  announcementId: string,
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
    await updateAnnouncement(announcementId, {
      title: values.title,
      content: values.content,
      is_pinned: values.isPinned,
    });

    refreshAnnouncementPages(announcementId);
  } catch (error) {
    console.error("Announcement update failed.", error);

    return {
      status: "error",
      message:
        "The announcement could not be saved. Please try again.",
      errors: {},
    };
  }

  redirect("/admin/announcements?saved=1");
}

export async function deleteAnnouncementAction(
  announcementId: string,
  _formData: FormData,
): Promise<void> {
  try {
    await deleteAnnouncement(announcementId);
    refreshAnnouncementPages(announcementId);
  } catch (error) {
    console.error("Announcement delete failed.", error);
    redirect(
      `/admin/announcements/${announcementId}/edit?deleteError=1`,
    );
  }

  redirect("/admin/announcements?deleted=1");
}