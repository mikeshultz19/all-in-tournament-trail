import type { MemberPot, RegistrationType } from "@/lib/registration";

export interface EarlyRegistrationRecord {
  id: string;
  tournamentSlug: string;
  registeredAt: string;
  registrationType: RegistrationType;
  angler1: { publicDisplayName: string; email: string; phone: string };
  angler2: { publicDisplayName: string; email: string; phone: string } | null;
  bigBass: boolean;
  memberPot: MemberPot | null;
  insurance: boolean;
  paymentReference: string;
  adminNotes: string | null;
}

export interface PublicEarlyEntry {
  registeredAt: string;
  entryMode: RegistrationType;
  angler1DisplayName: string;
  angler2DisplayName: string | null;
  bigBassSelected: boolean;
  bonusPot: MemberPot | null;
  insurancePotSelected: boolean;
}

export interface TournamentEntrySummary {
  totalEntries: number;
  teamEntries: number;
  soloEntries: number;
  bigBassEntries: number;
  bronzeEntries: number;
  silverEntries: number;
  goldEntries: number;
  insurancePotEntries: number;
}

/** Explicitly projects a registration to the only fields approved for public use. */
export function toPublicEarlyEntry(
  registration: EarlyRegistrationRecord,
): PublicEarlyEntry {
  return {
    registeredAt: registration.registeredAt,
    entryMode: registration.registrationType,
    angler1DisplayName: registration.angler1.publicDisplayName,
    angler2DisplayName: registration.angler2?.publicDisplayName ?? null,
    bigBassSelected: registration.bigBass,
    bonusPot: registration.memberPot,
    insurancePotSelected: registration.insurance,
  };
}

export function sortPublicEarlyEntries(
  entries: readonly PublicEarlyEntry[],
): PublicEarlyEntry[] {
  return entries.toSorted(
    (first, second) =>
      new Date(first.registeredAt).getTime() -
      new Date(second.registeredAt).getTime(),
  );
}

export function getTournamentEntrySummary(
  entries: readonly PublicEarlyEntry[],
): TournamentEntrySummary {
  return entries.reduce<TournamentEntrySummary>(
    (summary, entry) => ({
      totalEntries: summary.totalEntries + 1,
      teamEntries: summary.teamEntries + Number(entry.entryMode === "team"),
      soloEntries: summary.soloEntries + Number(entry.entryMode === "solo"),
      bigBassEntries: summary.bigBassEntries + Number(entry.bigBassSelected),
      bronzeEntries: summary.bronzeEntries + Number(entry.bonusPot === "bronze"),
      silverEntries: summary.silverEntries + Number(entry.bonusPot === "silver"),
      goldEntries: summary.goldEntries + Number(entry.bonusPot === "gold"),
      insurancePotEntries:
        summary.insurancePotEntries + Number(entry.insurancePotSelected),
    }),
    {
      totalEntries: 0,
      teamEntries: 0,
      soloEntries: 0,
      bigBassEntries: 0,
      bronzeEntries: 0,
      silverEntries: 0,
      goldEntries: 0,
      insurancePotEntries: 0,
    },
  );
}
