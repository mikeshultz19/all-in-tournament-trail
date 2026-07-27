import { notFound } from "next/navigation";

import EditAnnouncementForm from "@/components/admin/EditAnnouncementForm";
import { getAnnouncementById } from "@/lib/news";

export const dynamic = "force-dynamic";

interface EditAnnouncementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementPageProps) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return <EditAnnouncementForm announcement={announcement} />;
}