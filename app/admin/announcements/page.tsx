import AdminAnnouncementList from "@/components/admin/AdminAnnouncementList";
import { getAnnouncements } from "@/lib/news";
import type { Announcement } from "@/types/announcement";

export const dynamic = "force-dynamic";

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const saved = (await searchParams).saved === "1";
  let announcements: Announcement[] = [];
  let loadFailed = false;

  try {
    announcements = await getAnnouncements();
  } catch (error) {
    console.error("Admin news list load failed.", error);
    loadFailed = true;
  }

  return (
    <AdminAnnouncementList
      announcements={announcements}
      loadFailed={loadFailed}
      successMessage={
        saved && !loadFailed ? "Changes saved successfully." : undefined
      }
    />
  );
}
