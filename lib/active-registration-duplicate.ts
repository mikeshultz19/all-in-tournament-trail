export type DuplicateCheckAngler = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  mobilePhone?: string | null;
};

export type DuplicateCheckCanonicalAngler = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function samePerson(submitted: DuplicateCheckAngler, canonical: DuplicateCheckCanonicalAngler) {
  const submittedName = normalize(`${submitted.firstName ?? ""}${submitted.lastName ?? ""}`);
  const canonicalName = normalize(`${canonical.first_name}${canonical.last_name}`);
  if (!submittedName || submittedName !== canonicalName) return false;

  const submittedEmail = normalize(submitted.email);
  const canonicalEmail = normalize(canonical.email);
  const submittedPhone = normalize(submitted.mobilePhone);
  const canonicalPhone = normalize(canonical.phone);

  return Boolean(
    (submittedEmail && canonicalEmail && submittedEmail === canonicalEmail) ||
    (submittedPhone && canonicalPhone && submittedPhone === canonicalPhone),
  );
}

export function findActiveRegistrationDuplicatePositions(
  anglers: readonly DuplicateCheckAngler[],
  canonicalAnglers: readonly DuplicateCheckCanonicalAngler[],
  activeAnglerIds: ReadonlySet<string>,
) {
  return anglers.reduce<number[]>((duplicates, angler, index) => {
    if (canonicalAnglers.some((canonical) => activeAnglerIds.has(canonical.id) && samePerson(angler, canonical))) {
      duplicates.push(index + 1);
    }
    return duplicates;
  }, []);
}
