export function formatMembershipSummary(
  membershipSnapshot: Array<Record<string, unknown>> | null,
  registrationType: "team" | "solo",
) {
  const parts = (membershipSnapshot ?? []).map((snapshot) => {
    if (snapshot?.eligibleForTournament === true) return "Member";
    if (snapshot?.eligibleForTournament === false) return "Non-Member";
    return "Needs Review";
  });

  if (!parts.length) return "Needs Review";
  return registrationType === "team" ? parts.join(" / ") : parts[0];
}
