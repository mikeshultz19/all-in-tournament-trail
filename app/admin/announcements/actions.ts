"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import { deleteAnnouncement } from "@/lib/news";

export async function deleteAnnouncementAction(
  announcementId: string,
): Promise<void> {
  await requireAdminUser();

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
