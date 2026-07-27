"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteAnnouncement } from "@/lib/news";

export async function deleteAnnouncementAction(
  announcementId: string,
  _formData: FormData,
): Promise<void> {
  try {
    await deleteAnnouncement(announcementId);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/announcements");
  } catch (error) {
    console.error("Announcement delete failed.", error);
    redirect("/admin/announcements?deleteError=1");
  }

  redirect("/admin/announcements?deleted=1");
}