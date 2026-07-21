import {
  sortPublicEarlyEntries,
  toPublicEarlyEntry,
  type EarlyRegistrationRecord,
} from "@/lib/public-early-entry";

const earlyRegistrationRecords: readonly EarlyRegistrationRecord[] = [
  {
    id: "early-em-004",
    tournamentSlug: "eagle-mountain-2026",
    registeredAt: "2026-07-10T23:34:00.000Z",
    registrationType: "team",
    angler1: { publicDisplayName: "Marcus Reed", email: "private4@example.com", phone: "555-0104" },
    angler2: { publicDisplayName: "Eli Turner", email: "private5@example.com", phone: "555-0105" },
    bigBass: true,
    memberPot: "gold",
    insurance: true,
    paymentReference: "private-payment-004",
    adminNotes: null,
  },
  {
    id: "early-em-001",
    tournamentSlug: "eagle-mountain-2026",
    registeredAt: "2026-07-08T14:15:00.000Z",
    registrationType: "team",
    angler1: { publicDisplayName: "Caleb Brooks", email: "private1@example.com", phone: "555-0101" },
    angler2: { publicDisplayName: "Drew Carter", email: "private2@example.com", phone: "555-0102" },
    bigBass: true,
    memberPot: "bronze",
    insurance: false,
    paymentReference: "private-payment-001",
    adminNotes: "Private fixture note",
  },
  {
    id: "early-em-003",
    tournamentSlug: "eagle-mountain-2026",
    registeredAt: "2026-07-10T17:05:00.000Z",
    registrationType: "team",
    angler1: { publicDisplayName: "Noah Bennett", email: "private3@example.com", phone: "555-0103" },
    angler2: { publicDisplayName: "Luke Hayes", email: "private6@example.com", phone: "555-0106" },
    bigBass: false,
    memberPot: "silver",
    insurance: true,
    paymentReference: "private-payment-003",
    adminNotes: null,
  },
  {
    id: "early-em-002",
    tournamentSlug: "eagle-mountain-2026",
    registeredAt: "2026-07-09T20:42:00.000Z",
    registrationType: "solo",
    angler1: { publicDisplayName: "Avery Collins", email: "private7@example.com", phone: "555-0107" },
    angler2: null,
    bigBass: false,
    memberPot: null,
    insurance: false,
    paymentReference: "private-payment-002",
    adminNotes: null,
  },
];

export function getPublicEarlyEntries(tournamentSlug: string) {
  return sortPublicEarlyEntries(
    earlyRegistrationRecords
      .filter((registration) => registration.tournamentSlug === tournamentSlug)
      .map(toPublicEarlyEntry),
  );
}

export { earlyRegistrationRecords };
