export const REGISTRATION_PRICING = {
  annualMembership: 40,
  baseEntry: 60,
  bronze: 40,
  silver: 100,
  gold: 500,
  bigBass: 20,
  insurance: 20,
} as const;

export const REGISTRATION_OPTION_CONFIG = {
  tournament_entry: {
    name: "Tournament Entry",
    description: "Required entry for every solo and team registration.",
    priceCents: REGISTRATION_PRICING.baseEntry * 100,
    required: true,
    priceBasis: "per_registration",
    membershipRequired: false,
  },
  big_bass: {
    name: "Big Bass",
    description: "Optional entry for the event's heaviest bass.",
    priceCents: REGISTRATION_PRICING.bigBass * 100,
    required: false,
    priceBasis: "per_registration",
    membershipRequired: false,
  },
  insurance: {
    name: "Insurance Pot",
    description: "Member-only out-of-the-money protection under the approved tournament rules.",
    priceCents: REGISTRATION_PRICING.insurance * 100,
    required: false,
    priceBasis: "per_registration",
    membershipRequired: true,
  },
  bronze: {
    name: "Bronze Pot",
    description: "Member-only Bronze payout competition. Pays 1 in 5.",
    priceCents: REGISTRATION_PRICING.bronze * 100,
    required: false,
    priceBasis: "per_registration",
    membershipRequired: true,
  },
  silver: {
    name: "Silver Pot",
    description: "Member-only Silver payout competition. Pays 1 in 5.",
    priceCents: REGISTRATION_PRICING.silver * 100,
    required: false,
    priceBasis: "per_registration",
    membershipRequired: true,
  },
  gold: {
    name: "Gold Pot",
    description: "Member-only premium Gold payout competition. Pays 1 in 5.",
    priceCents: REGISTRATION_PRICING.gold * 100,
    required: false,
    priceBasis: "per_registration",
    membershipRequired: true,
  },
} as const;

export const TOURNAMENT_REGISTRATION_CONFIG = {
  allowedTypes: ["solo", "team"],
  capacity: null,
  onlineRegistrationEnabled: true,
  optionIds: [
    "tournament_entry",
    "big_bass",
    "insurance",
    "bronze",
    "silver",
    "gold",
  ],
} as const;
