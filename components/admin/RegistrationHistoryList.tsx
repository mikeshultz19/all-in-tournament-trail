import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { RegistrationEditControl } from "@/components/admin/RegistrationOperationsControls";
import type { AdminRegistrationHistoryRow, RegistrationHistoryContact } from "@/lib/admin-registration-history";

type MembershipSnapshot = {
  submittedClassification?: string;
  resolvedClassification?: string;
  status?: string;
};

export default function RegistrationHistoryList({
  rows,
}: {
  rows: readonly AdminRegistrationHistoryRow[];
}) {
  if (!rows.length) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-sm border border-white/10 bg-[#111111]" aria-label="Registration history results">
      <div className="hidden border-b border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500 lg:grid lg:grid-cols-[74px_minmax(170px,1.35fr)_72px_minmax(220px,1.6fr)_144px_150px_120px_114px_28px] lg:gap-4">
        <span>Boat #</span>
        <span>Tournament</span>
        <span>Type</span>
        <span>Participants</span>
        <span>Registration / Status</span>
        <span>Member Status</span>
        <span>Payment / Paid</span>
        <span>Registered</span>
        <span className="sr-only">Expand</span>
      </div>

      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <details key={row.id} className="group">
            <summary className="grid list-none cursor-pointer gap-3 px-4 py-4 transition hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D4A017] lg:grid-cols-[74px_minmax(170px,1.35fr)_72px_minmax(220px,1.6fr)_144px_150px_120px_114px_28px] lg:items-center lg:gap-4 [&::-webkit-details-marker]:hidden">
              <SummaryField label="Boat #" className="lg:justify-center">
                <span className="text-lg font-black text-[#D4A017] lg:text-base">
                  {row.boatNumber?.toString() ?? "—"}
                </span>
              </SummaryField>
              <SummaryField label="Tournament">
                <span className="block font-semibold text-white">
                  {row.tournamentName}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {dateOnly(row.tournamentDate)}
                </span>
              </SummaryField>
              <SummaryField label="Type" className="lg:justify-center">
                <AdminStatusBadge className="min-h-6">
                  {row.registrationType === "team" ? "Team" : "Solo"}
                </AdminStatusBadge>
              </SummaryField>
              <SummaryField label="Participants">
                <span className="block break-words font-bold text-neutral-100">
                  {row.angler1Name}
                  {row.angler2Name ? ` / ${row.angler2Name}` : ""}
                </span>
              </SummaryField>
              <SummaryField label="Registration / Status">
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge tone={row.source === "walk_up" ? "attention" : "neutral"}>
                    {row.source === "walk_up" ? "Walk-Up" : "Online"}
                  </AdminStatusBadge>
                  <AdminStatusBadge tone={row.status === "cancelled" ? "critical" : "positive"}>
                    {row.status}
                  </AdminStatusBadge>
                  {needsAttention(row) ? <AdminStatusBadge tone="attention">Needs Attention</AdminStatusBadge> : null}
                </div>
              </SummaryField>
              <SummaryField label="Member Status">
                <span className="block text-sm font-semibold text-neutral-200">
                  {memberStatusSummary(row)}
                </span>
              </SummaryField>
              <SummaryField label="Payment / Paid">
                <span className="block text-sm font-semibold text-neutral-200">
                  {paymentSummary(row)}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {money(row.priceSnapshot?.totalCents)}
                </span>
              </SummaryField>
              <SummaryField label="Registered">
                <span className="block text-sm font-semibold text-neutral-200">
                  {dateOnly(row.registeredAt)}
                </span>
              </SummaryField>
              <span className="flex items-center justify-start lg:justify-end">
                <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-neutral-500 transition group-open:rotate-180 group-open:text-white" />
              </span>
            </summary>

            <div className="border-t border-white/10 px-4 py-4 sm:px-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <DetailSection title="Submitted Participants">
                  {row.contacts.length ? row.contacts.map((contact, index) => (
                    <address key={`${contact.email}-${index}`} className="mt-3 not-italic text-sm leading-6 text-neutral-300">
                      <strong className="text-white">Angler {index + 1}: {contact.firstName} {contact.lastName}</strong><br />
                      {contact.streetAddress}<br />
                      {contact.city}, {contact.state} {contact.zipCode}<br />
                      <a href={`mailto:${contact.email}`} className="break-all text-[#D4A017]">{contact.email}</a><br />
                      <a href={`tel:${contact.phone}`} className="text-[#D4A017]">{contact.phone}</a><br />
                      Membership selection: {membershipLabel(contact.membership)}
                    </address>
                  )) : <p className="text-sm text-neutral-500">No participant contact snapshot is stored for this historical record.</p>}
                </DetailSection>

                <DetailSection title="Registration Selections">
                  <DetailLine label="Type" value={row.registrationType} />
                  <DetailLine label="Big Bass" value={yesNo(row.bigBass)} />
                  <DetailLine label="Member Pot" value={row.memberPot ?? "None"} />
                  <DetailLine label="Insurance Pot" value={yesNo(row.insurance)} />
                  <DetailLine label="Source" value={row.source === "walk_up" ? "Walk-Up" : "Online"} />
                  <DetailLine label="Status" value={row.status} />
                  <DetailLine label="Payment Method" value={row.paymentMethod ?? "Not stored"} />
                  <DetailLine label="Payment Reference" value={row.paymentReference ?? "Not recorded"} />
                  <DetailLine label="Online Payment" value={row.onlinePaymentState ?? "Not applicable"} />
                </DetailSection>

                <DetailSection title="Payment &amp; Pricing">
                  {(row.priceSnapshot?.lineItems ?? []).map((item, index) => (
                    <DetailLine key={`${item.name}-${index}`} label={item.name ?? `Line ${index + 1}`} value={money(item.priceCents)} />
                  ))}
                  <DetailLine label="Card Processing Fee" value={money(row.priceSnapshot?.cardProcessingFeeCents)} />
                  <DetailLine label="Total Paid" value={money(row.priceSnapshot?.totalCents)} />
                  <DetailLine label="Square Payment ID" value={row.squarePaymentId ?? "Not recorded"} />
                </DetailSection>

                <DetailSection title="Membership Snapshot">
                  {row.membershipSnapshot.length ? row.membershipSnapshot.map((snapshot, index) => (
                    <div key={index} className="mt-2 border border-white/10 p-3 text-xs leading-5 text-neutral-300">
                      <p className="font-bold text-white">Angler {index + 1}</p>
                      <p>Submitted: {String((snapshot as MembershipSnapshot).submittedClassification ?? "Unknown")}</p>
                      <p>Resolved: {String((snapshot as MembershipSnapshot).resolvedClassification ?? "Unknown")}</p>
                      <p>Status: {String((snapshot as MembershipSnapshot).status ?? "Not stored")}</p>
                    </div>
                  )) : <p className="text-sm text-neutral-500">No membership snapshot stored.</p>}
                </DetailSection>

                <DetailSection title="Needs Attention / Review History">
                  {row.reviews.length ? row.reviews.map((review) => (
                    <div key={review.id} className="mt-2 border border-amber-400/20 p-3 text-xs leading-5 text-neutral-300">
                      <p className="font-bold text-amber-200">{review.participantName} · {review.kind} · {review.status}</p>
                      <p>{review.reason}</p>
                      {review.note ? <p>Note: {review.note}</p> : null}
                      {review.resolvedAt ? <p>Resolved: {dateTime(review.resolvedAt)}</p> : null}
                      {review.history.map((item, index) => (
                        <p key={index} className="mt-2 border-t border-white/10 pt-2">
                          {item.previousStatus} → {item.newStatus} via {item.method}
                          {item.note ? ` · ${item.note}` : ""}
                          {" · "}
                          {dateTime(item.createdAt)}
                        </p>
                      ))}
                    </div>
                  )) : <p className="text-sm text-neutral-500">No review records.</p>}
                </DetailSection>
              </div>

              {row.status === "active" ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <RegistrationEditControl
                    tournamentId={row.tournamentId}
                    registrationId={row.id}
                    boatNumber={row.boatNumber}
                    bigBass={row.bigBass}
                    memberPot={row.memberPot}
                    insurance={row.insurance}
                    checkedIn={Boolean(row.checkedInAt)}
                    walkUp={row.source === "walk_up"}
                    contactSnapshot={row.contacts}
                  />
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function needsAttention(row: AdminRegistrationHistoryRow) {
  return row.identityReviewStatus === "review_required" || row.reviews.some((review) => review.status === "review_required");
}

function memberStatusSummary(row: AdminRegistrationHistoryRow) {
  const statuses = row.membershipSnapshot.map((snapshot, index) => {
    const membership = snapshot as MembershipSnapshot;
    const label =
      membership.resolvedClassification === "current" || membership.submittedClassification === "current"
        ? "Current Member"
        : membership.submittedClassification === "joining"
          ? "Purchased / Joining"
          : membership.resolvedClassification === "non-member" || membership.submittedClassification === "non-member"
            ? "Non-Member"
            : "Needs Review";
    return row.registrationType === "team" ? `A${index + 1} ${label}` : label;
  });
  return statuses.length ? statuses.join(" / ") : "No snapshot";
}

function SummaryField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`min-w-0 ${className}`}>
      <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500 lg:sr-only">
        {label}
      </span>
      {children}
    </span>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-red-400">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-1 text-sm text-neutral-300">
      <span className="font-bold text-white">{label}:</span> {value}
    </p>
  );
}

function membershipLabel(value: RegistrationHistoryContact["membership"]) {
  return value === "current"
    ? "Current Member"
    : value === "joining"
      ? "Joining / Purchased"
      : "Non-Member";
}

function paymentSummary(row: AdminRegistrationHistoryRow) {
  if (row.source === "online") {
    return row.onlinePaymentState === "completed" && row.squarePaymentId
      ? "Completed"
      : "Needs Review";
  }
  return row.paymentReference ? "Recorded" : "Needs Review";
}

function money(value: number | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100)
    : "Not stored";
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function dateOnly(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
