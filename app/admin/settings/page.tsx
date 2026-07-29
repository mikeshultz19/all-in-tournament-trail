import ActiveSeasonForm from "@/components/admin/ActiveSeasonForm";
import { getActiveSeason, listSeasons } from "@/lib/seasons";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [seasons, activeSeason] = await Promise.all([
    listSeasons(),
    getActiveSeason(),
  ]);

  return (
    <>
      <div className="border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Admin Center
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Settings
        </h1>
      </div>

      <section className="mt-8 border border-white/10 bg-[#111111] p-5 sm:p-7">
        <h2 className="text-lg font-black uppercase tracking-tight text-red-500">
          Membership
        </h2>
        {seasons.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            No seasons are available. Create a season before selecting the
            active membership season.
          </p>
        ) : (
          <ActiveSeasonForm
            seasons={seasons}
            activeSeasonId={activeSeason?.id}
          />
        )}
      </section>
    </>
  );
}
