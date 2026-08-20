import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function PrepareTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  await requireAdminUser();
  const { tournament } = await searchParams;
  const query = tournament
    ? `?tournament=${encodeURIComponent(tournament)}`
    : "";

  redirect(`/admin/registration-review${query}`);
}
