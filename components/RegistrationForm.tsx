"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

import PaymentOptions from "@/components/PaymentOptions";
import SafeLightCard from "@/components/SafeLightCard";
import TournamentStatusAnnouncement from "@/components/TournamentStatusAnnouncement";
import { REGISTRATION_PRICING } from "@/data/registration";
import { tournaments } from "@/data/tournaments";
import type { TournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getRegistrationPricing, hasFullMembershipEligibility, validateRegistrationSelections, type MemberPot, type Membership, type RegistrationType } from "@/lib/registration";

type AnglerKey = "angler1" | "angler2";
type Angler = {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  membership: Membership | null;
};
type FieldKey = keyof Angler;
type Errors = Partial<Record<`${AnglerKey}.${FieldKey}`, string>>;
type RegistrationAngler = Angler & { role: "boater" | "co-angler" };
type RegistrationPayload = {
  registrationType: RegistrationType;
  tournamentSlug: string;
  anglers: RegistrationAngler[];
  baseEntry: true;
  memberPot: MemberPot | null;
  bigBass: boolean;
  insurance: boolean;
  subtotal: number;
  processingFee: number;
  total: number;
};

const EMPTY_ANGLER: Angler = { firstName: "", lastName: "", email: "", streetAddress: "", city: "", state: "", zipCode: "", membership: null };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;
const OPTIONAL_POTS = [
  { id: "bronze", name: "Bronze Pot", price: REGISTRATION_PRICING.bronze, description: "Members-only Bronze payout competition. Pays 1 in 5." },
  { id: "silver", name: "Silver Pot", price: REGISTRATION_PRICING.silver, description: "Members-only Silver payout competition. Pays 1 in 5." },
  { id: "gold", name: "Gold Pot", price: REGISTRATION_PRICING.gold, description: "Members-only premium Gold payout competition. Pays 1 in 5." },
  { id: "big-bass", name: "Big Bass", price: REGISTRATION_PRICING.bigBass, description: "Open to every entry for the event's heaviest bass." },
  { id: "insurance", name: "Insurance Pot", price: REGISTRATION_PRICING.insurance, description: "Pays first out of the money from the Tournament Entry Pot until the available Insurance Pot money is exhausted." },
] as const;

function money(value: number) { return `$${value.toFixed(2)}`; }
function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }

function validateAngler(key: AnglerKey, angler: Angler) {
  const errors: Errors = {};
  const firstName = angler.firstName.trim();
  const lastName = angler.lastName.trim();
  if (firstName.length < 2) errors[`${key}.firstName`] = "First name is required.";
  if (lastName.length < 2) errors[`${key}.lastName`] = "Last name is required.";
  if (!EMAIL_PATTERN.test(angler.email.trim())) errors[`${key}.email`] = "Enter a valid email address including a domain, such as name@example.com.";
  if (angler.streetAddress.trim().length < 3) errors[`${key}.streetAddress`] = "Street address is required.";
  if (angler.city.trim().length < 2) errors[`${key}.city`] = "City is required.";
  if (!STATE_PATTERN.test(angler.state.trim())) errors[`${key}.state`] = "Enter a valid 2-letter state code.";
  if (!ZIP_PATTERN.test(angler.zipCode.trim())) errors[`${key}.zipCode`] = "Enter a valid 5-digit or ZIP+4 code.";
  if (!angler.membership) errors[`${key}.membership`] = "Select a membership status.";
  return errors;
}

function AnglerSection({ anglerKey, title, angler, errors, onChange }: { anglerKey: AnglerKey; title: string; angler: Angler; errors: Errors; onChange: (key: AnglerKey, field: keyof Angler, value: string) => void }) {
  const fields = [
    { key: "firstName", label: "First Name", type: "text", autoComplete: anglerKey === "angler1" ? "given-name" : "off" },
    { key: "lastName", label: "Last Name", type: "text", autoComplete: anglerKey === "angler1" ? "family-name" : "off" },
    { key: "email", label: "Email", type: "email", autoComplete: anglerKey === "angler1" ? "email" : "off" },
    { key: "streetAddress", label: "Street Address", type: "text", autoComplete: anglerKey === "angler1" ? "street-address" : "off" },
    { key: "city", label: "City", type: "text", autoComplete: anglerKey === "angler1" ? "address-level2" : "off" },
    { key: "state", label: "State", type: "text", autoComplete: anglerKey === "angler1" ? "address-level1" : "off", maxLength: 2 },
    { key: "zipCode", label: "ZIP Code", type: "text", autoComplete: anglerKey === "angler1" ? "postal-code" : "off", inputMode: "numeric" },
  ] as const;
  const membershipError = errors[`${anglerKey}.membership`];

  return <fieldset className="border-t border-[#333] pt-6 first:border-t-0 first:pt-0">
    <legend className="mb-5 text-base font-black uppercase tracking-wide text-white">{title}</legend>
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `${anglerKey}-${field.key}`;
        const error = errors[`${anglerKey}.${field.key}`];
        return <div key={field.key} className={field.key === "email" || field.key === "streetAddress" ? "sm:col-span-2" : ""}>
          <label htmlFor={id} className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#C6C6C6]">{field.label}</label>
          <input id={id} name={`${anglerKey}.${field.key}`} value={angler[field.key] ?? ""} onChange={(event) => onChange(anglerKey, field.key, field.key === "state" ? event.target.value.toUpperCase() : event.target.value)} onBlur={(event) => onChange(anglerKey, field.key, event.target.value.trim())} type={field.type} autoComplete={field.autoComplete} maxLength={"maxLength" in field ? field.maxLength : undefined} inputMode={"inputMode" in field ? field.inputMode : undefined} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="min-h-12 w-full rounded-sm border border-[#3A3A3A] bg-[#0B0B0B] px-4 text-base text-white outline-none transition focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] aria-invalid:border-red-500" />
          {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-400" role="alert">{error}</p>}
        </div>;
      })}
    </div>
    <p className="mt-3 text-sm text-[#8E8E8E]">Required for tax and payout records.</p>
    <div className="mt-6" role="group" aria-labelledby={`${anglerKey}-membership-label`} aria-describedby={membershipError ? `${anglerKey}-membership-error` : undefined}>
      <p id={`${anglerKey}-membership-label`} className="text-xs font-black uppercase tracking-[0.12em] text-[#C6C6C6]">Membership status</p>
      <div className="mt-3 grid gap-3">
        {([['current', 'Yes, I am a current member'], ['joining', 'No, but I want to join'], ['non-member', 'No, continue as a non-member']] as const).map(([value, label]) => <label key={value} className="flex min-h-14 cursor-pointer items-center gap-4 border border-[#333] bg-[#111] px-4 py-3 has-checked:border-[#D4A017]"><input id={`${anglerKey}-membership-${value}`} type="radio" name={`${anglerKey}.membership`} value={value} checked={angler.membership === value} onChange={() => onChange(anglerKey, "membership", value)} className="size-5 accent-[#D4A017]" /><span className="font-bold text-white">{label}</span></label>)}
      </div>
      {membershipError && <p id={`${anglerKey}-membership-error`} className="mt-2 text-sm text-red-400" role="alert">{membershipError}</p>}
    </div>
  </fieldset>;
}

export default function RegistrationForm({
  operationsBySlug,
  initialSlug,
}: {
  operationsBySlug: Record<string, TournamentOperationsViewModel>;
  initialSlug?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>("solo");
  const [anglers, setAnglers] = useState<Record<AnglerKey, Angler>>({ angler1: { ...EMPTY_ANGLER }, angler2: { ...EMPTY_ANGLER } });
  const [errors, setErrors] = useState<Errors>({});
  const [slug, setSlug] = useState(initialSlug ?? tournaments[0].slug);
  const [memberPot, setMemberPot] = useState<MemberPot | null>(null);
  const [bigBass, setBigBass] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [, setRegistrationRecord] = useState<RegistrationPayload | null>(null);
  const tournament = tournaments.find((item) => item.slug === slug) ?? tournaments[0];
  const operations = operationsBySlug[tournament.slug];
  const activeKeys = useMemo<AnglerKey[]>(() => registrationType === "team" ? ["angler1", "angler2"] : ["angler1"], [registrationType]);
  const memberships = activeKeys.map((key) => anglers[key].membership).filter((membership): membership is Membership => membership !== null);
  const fullMembershipEligibility = hasFullMembershipEligibility({ registrationType, memberships });
  const memberPotsEnabled = fullMembershipEligibility;

  const pricing = getRegistrationPricing({ registrationType, baseEntry: true, memberships, memberPot: fullMembershipEligibility ? memberPot : null, bigBass, insurance: fullMembershipEligibility && insurance });
  const { lineItems, subtotal, processingFee: fee, total } = pricing;
  const currentErrors = activeKeys.reduce<Errors>((all, key) => ({ ...all, ...validateAngler(key, anglers[key]) }), {});
  const formIsValid = Object.keys(currentErrors).length === 0 && (!(memberPot || insurance) || memberPotsEnabled);
  const canSubmit = formIsValid && operations.registrationCanSubmit;

  function updateAngler(key: AnglerKey, field: keyof Angler, value: string) {
    setAnglers((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
    if (field === "membership" && value === "non-member") { setMemberPot(null); setInsurance(false); }
    setErrors((current) => { const next = { ...current }; delete next[`${key}.${field as FieldKey}`]; return next; });
    setSubmitMessage("");
  }

  function changeRegistrationType(value: RegistrationType) {
    setRegistrationType(value);
    setErrors((current) => value === "solo" ? Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith("angler2."))) : current);
    const eligible = value === "solo" ? anglers.angler1.membership !== "non-member" && anglers.angler1.membership !== null : [anglers.angler1, anglers.angler2].every((angler) => angler.membership === "current" || angler.membership === "joining");
    if (!eligible) { setMemberPot(null); setInsurance(false); }
    setSubmitMessage("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = activeKeys.reduce<Errors>((all, key) => ({ ...all, ...validateAngler(key, anglers[key]) }), {});
    setErrors(nextErrors);
    if (!operations.registrationCanSubmit) {
      setSubmitMessage(operations.registrationReason);
      return;
    }
    if (Object.keys(nextErrors).length || !formIsValid) {
      setSubmitMessage("Complete all required angler information before payment.");
      const firstKey = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus());
      return;
    }
    const normalizedAnglers: RegistrationAngler[] = activeKeys.map((key) => ({
      role: key === "angler1" ? "boater" : "co-angler",
      ...anglers[key],
      firstName: anglers[key].firstName.trim(),
      lastName: anglers[key].lastName.trim(),
      email: anglers[key].email.trim(),
      streetAddress: anglers[key].streetAddress.trim(),
      city: anglers[key].city.trim(),
      state: anglers[key].state.trim().toUpperCase(),
      zipCode: anglers[key].zipCode.trim(),
    }));
    const registrationPayload: RegistrationPayload = {
      registrationType,
      tournamentSlug: slug,
      anglers: normalizedAnglers,
      baseEntry: true,
      memberPot,
      bigBass,
      insurance,
      subtotal,
      processingFee: fee,
      total,
    };
    const selectionErrors = validateRegistrationSelections({ registrationType, baseEntry: registrationPayload.baseEntry, memberships, memberPot, bigBass, insurance });
    if (selectionErrors.length) { setSubmitMessage(selectionErrors.join(" ")); return; }
    setRegistrationRecord(registrationPayload);
    setAnglers((current) => ({ ...current, angler1: normalizedAnglers[0], angler2: registrationType === "team" ? normalizedAnglers[1] : { ...EMPTY_ANGLER } }));
    setSubmitMessage("Stripe Checkout is not connected yet. Your selections are ready for payment.");
  }

  const disabledReason = registrationType === "team" ? "Both anglers must be members to receive team member benefits." : "Membership is required for this option";

  return <form ref={formRef} noValidate className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12 lg:py-14" onSubmit={submit}>
    <div className="space-y-10">
      <section aria-labelledby="registration-type-heading">
        <h2 id="registration-type-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Registration Type</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{([['solo', 'Solo'], ['team', 'Team']] as const).map(([value, label]) => <label key={value} className="flex min-h-14 cursor-pointer items-center gap-4 border border-[#333] bg-[#111] px-4 py-3 has-checked:border-[#D4A017]"><input type="radio" name="registrationType" value={value} checked={registrationType === value} onChange={() => changeRegistrationType(value)} className="size-5 accent-[#D4A017]" /><span className="font-black uppercase text-white">{label}</span></label>)}</div>
      </section>

      <section aria-labelledby="angler-heading" className="border-t border-[#4A3A12] pt-8">
        <h2 id="angler-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Angler Information</h2>
        <p className="mt-3 text-sm text-[#B8B8B8]">Annual Membership: <strong className="text-white">$40 per angler</strong></p>
        <div className="mt-6 space-y-8"><AnglerSection anglerKey="angler1" title="Angler 1" angler={anglers.angler1} errors={errors} onChange={updateAngler} />{registrationType === "team" && <AnglerSection anglerKey="angler2" title="Angler 2 / Co-Angler" angler={anglers.angler2} errors={errors} onChange={updateAngler} />}</div>
        {registrationType === "team" && !fullMembershipEligibility && <p className="mt-5 border-l-2 border-[#D4A017] pl-4 text-sm font-bold text-[#D4A017]">Both anglers must be members to receive team member benefits.</p>}
        <p className="mt-5 border-l-2 border-[#D4A017] pl-4 text-sm leading-6 text-[#B8B8B8]"><strong className="font-semibold text-white">Memberships unlock access to</strong> <strong className="font-bold text-white">Bronze</strong>, <strong className="font-bold text-white">Silver</strong>, <strong className="font-bold text-white">Gold</strong>, <strong className="font-bold text-white">the Insurance Pot</strong>, <strong className="font-bold text-white">AOY points</strong>, and <strong className="font-bold text-white">Championship eligibility</strong>.</p>
      </section>

      <section aria-labelledby="tournament-heading" className="border-t border-[#4A3A12] pt-8">
        <h2 id="tournament-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Tournament Selection</h2>
        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#C6C6C6]">Select Tournament</span>
          <select value={slug} onChange={(event) => { setSlug(event.target.value); setSubmitMessage(""); }} className="min-h-12 w-full rounded-sm border border-[#3A3A3A] bg-[#111] px-4 text-white outline-none focus:border-[#D4A017]">
            {tournaments.map((item) => <option key={item.slug} value={item.slug}>{item.lake} — {operationsBySlug[item.slug]?.formattedEffectiveDate ?? formatDate(item.date)}</option>)}
          </select>
        </label>
        <div className="mt-4 border border-[#4A3A12] bg-[#111] px-5 py-4" aria-label="Tournament summary">
          <dl className="grid gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#3A3A3A]">
            <div className="sm:pr-5"><dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">Tournament</dt><dd className="mt-1 font-bold text-white">{tournament.lake}</dd></div>
            <div className="sm:px-5"><dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">Date</dt><dd className="mt-1 font-bold text-white">{operations.formattedEffectiveDate}</dd></div>
            <div className="sm:pl-5"><dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">Launch</dt><dd className="mt-1 font-bold text-white">{tournament.venue ?? "To Be Announced"}{tournament.city ? `, ${tournament.city}` : ""}</dd></div>
          </dl>
        </div>
        <dl className="mt-4 grid gap-3 border-y border-[#333] py-4 text-sm sm:grid-cols-2">
          <div><dt className="font-black uppercase tracking-wide text-[#D4A017]">Early registration deadline</dt><dd className="mt-1 text-neutral-300">{operations.earlyRegistrationDeadline}</dd></div>
          <div><dt className="font-black uppercase tracking-wide text-[#D4A017]">Tournament-morning registration</dt><dd className="mt-1 text-neutral-300">{operations.tournamentMorningWindow ?? "Times have not been configured for this tournament."}</dd></div>
        </dl>
        <div className="mt-5 space-y-4">
          <TournamentStatusAnnouncement tournament={tournament} compact={tournament.tournamentStatus === "scheduled"} />
          <SafeLightCard safeLight={operations.safeLight} />
          <p className={`border-l-2 pl-4 text-sm font-semibold ${operations.registrationCanSubmit ? "border-[#D4A017] text-neutral-300" : "border-red-500 text-red-200"}`} role="status">
            {operations.registrationReason}
          </p>
        </div>
      </section>

      <section aria-labelledby="entry-heading" className="border-t border-[#4A3A12] pt-8"><h2 id="entry-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Tournament Registration</h2><div className="mt-5 border border-[#D4A017] bg-[#111] p-5" aria-label="Tournament Entry, required"><span className="flex items-center justify-between gap-4"><strong className="uppercase text-white">Tournament Entry <span className="text-xs text-[#D4A017]">Required</span></strong><strong className="text-[#D4A017]">{money(REGISTRATION_PRICING.baseEntry)}</strong></span><p className="mt-3 text-sm leading-5 text-[#B8B8B8]">Automatically included with every solo and team registration. Optional add-ons cannot be entered without it.</p></div></section>

      <section aria-labelledby="side-pots-heading" className="border-t border-[#4A3A12] pt-8"><h2 id="side-pots-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Optional Side Pots</h2><div className="mt-5 divide-y divide-[#333] border-y border-[#333]">{OPTIONAL_POTS.filter((option) => option.id === "big-bass" || option.id === "insurance").map((option) => { const isBigBass = option.id === "big-bass"; const disabled = !isBigBass && !memberPotsEnabled; const checked = isBigBass ? bigBass : insurance; return <label key={option.id} className={`flex items-start gap-4 py-5 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={() => { if (isBigBass) setBigBass(!bigBass); else setInsurance(!insurance); }} className="mt-1 size-5 shrink-0 accent-[#D4A017]" /><span className="min-w-0 flex-1"><span className="block font-black uppercase tracking-wide text-white">{option.name}</span><span className="mt-1 block text-sm leading-5 text-[#8E8E8E]">{option.description}</span>{disabled && <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-[#D4A017]">{disabledReason}</span>}</span><span className="font-black text-[#D4A017]">{money(option.price)}</span></label>; })}</div></section>

      <section aria-labelledby="bonus-pots-heading" className="border-t border-[#4A3A12] pt-8"><h2 id="bonus-pots-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Member Bonus Pots</h2><div className="mt-5 divide-y divide-[#333] border-y border-[#333]">{OPTIONAL_POTS.filter((option) => option.id === "bronze" || option.id === "silver" || option.id === "gold").map((option) => { const disabled = !memberPotsEnabled; const checked = memberPot === option.id; return <label key={option.id} className={`flex items-start gap-4 py-5 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={() => setMemberPot(memberPot === option.id ? null : option.id)} className="mt-1 size-5 shrink-0 accent-[#D4A017]" /><span className="min-w-0 flex-1"><span className="block font-black uppercase tracking-wide text-white">{option.name}</span><span className="mt-1 block text-sm leading-5 text-[#8E8E8E]">{option.description}</span>{disabled && <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-[#D4A017]">{disabledReason}</span>}</span><span className="font-black text-[#D4A017]">{money(option.price)}</span></label>; })}</div><p className="mt-4 text-sm text-[#999]">Choose only one member bonus pot: Bronze, Silver, or Gold.</p></section>
    </div>

    <aside className="border border-[#4A3A12] bg-[#111] p-6 lg:sticky lg:top-32"><h2 className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">Registration Summary</h2><div className="mt-6 space-y-4 text-sm">{lineItems.map((item) => <div key={item.name} className="flex justify-between gap-4 text-[#B8B8B8]"><span>{item.name}</span><span>{money(item.price)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-[#3A3A3A] pt-5 text-sm"><div className="flex justify-between text-[#B8B8B8]"><span>Processing Fee</span><span>{money(fee)}</span></div><div className="flex justify-between border-t border-[#3A3A3A] pt-4 text-lg font-black uppercase text-white"><span>Total Due</span><span className="text-[#D4A017]">{money(total)}</span></div></div><div className="mt-8"><PaymentOptions total={total} canSubmit={canSubmit} validationMessage={submitMessage} /></div></aside>
  </form>;
}
