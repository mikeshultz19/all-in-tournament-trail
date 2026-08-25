import { formatCurrencyFromCents } from "@/config/payment-policy";
import { formatRegistrationTournamentDate } from "@/components/RegistrationConfirmation";

const AITT_HOMEPAGE_URL = "https://allintrail.com";

export type RegistrationConfirmationEmailView = {
  boatNumber: number | null;
  tournamentName: string;
  tournamentDate: string;
  lake: string | null;
  ramp: string | null;
  launchType: string | null;
  morningRegistration: string | null;
  safeLight: string | null;
  scalesClose: string | null;
  anglers: string[];
  selectedOptions: string[];
  totalCents: number;
};

export function normalizeEmailAddress(value: string): string {
  return value.trim().toLowerCase();
}

export function uniqueRegistrationRecipients(emails: string[]): string[] {
  return [...new Set(emails.map(normalizeEmailAddress).filter(Boolean))];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  const tournamentContact = label === "Tournament / Lake"
    ? `<tr><td colspan="2" style="padding:14px;border:2px solid #d4a017;background:#111;color:#fff;font-size:15px;font-weight:700;line-height:1.5;text-align:center">AITT TOURNAMENT CONTACT: 817-841-9120 - PLEASE SAVE THIS NUMBER IN YOUR PHONE</td></tr><tr><td colspan="2" style="height:10px"></td></tr>`
    : "";
  return `${tournamentContact}<tr><td style="padding:6px 16px 6px 0;color:#777;font-size:13px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#111;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`;
}

export function buildRegistrationConfirmationEmail(view: RegistrationConfirmationEmailView) {
  const tournamentLake = [...new Set([view.tournamentName, view.lake].filter(Boolean))].join(" · ");
  const date = formatRegistrationTournamentDate(view.tournamentDate);
  const safeLight = view.safeLight
    ? `${row("Approx. Official Safe Light", view.safeLight)}<tr><td></td><td style="padding:0 0 8px;color:#555;font-size:12px;line-height:1.5">Have your boat in the water and ready to launch before this time.</td></tr>`
    : "";

  return {
    subject: `AITT Registration Confirmed — ${view.tournamentName}`,
    html: `<div style="background:#f4f4f4;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111"><div style="max-width:640px;margin:0 auto;background:#fff;padding:28px"><h1 style="margin:0;color:#16803a;font-size:26px">You’re Registered</h1><div style="margin-top:22px;padding:12px;background:#111;color:#fff"><div style="font-size:11px;font-weight:700;color:#d4a017;text-transform:uppercase">Registration / Boat Number</div><div style="margin-top:5px;font-size:22px;font-weight:700">${view.boatNumber ? `#${view.boatNumber}` : "TBA"}</div></div><p style="font-size:14px;line-height:1.6">Your boat number is your launch-order number. If flights are used, this number will also determine which flight you are in.</p><h2 style="margin:28px 0 8px;font-size:18px">Tournament Information</h2><div style="margin:0 0 14px;border:1px solid #d4a017;background:#fff8e6;padding:12px 14px"><div style="font-size:12px;font-weight:700;color:#9b7300;text-transform:uppercase;letter-spacing:0.04em">Fish Length Requirements</div><ul style="margin:10px 0 0;padding:0 0 0 18px;font-size:14px;line-height:1.6;color:#111"><li>Largemouth Bass: 14-inch minimum</li><li>Smallmouth Bass: 14-inch minimum</li><li>Spotted Bass: No minimum length</li></ul></div><table role="presentation" style="width:100%;border-collapse:collapse">${row("Tournament / Lake", tournamentLake)}${row("Date", date)}${row("Ramp / Launch Location", view.ramp)}${row("Launch Type", view.launchType)}${row("Morning Registration / Check-In", view.morningRegistration)}${safeLight}${row("Scales Close / Weigh-In", view.scalesClose)}${row("Registered Anglers", view.anglers.join(" / "))}${row("Memberships / Options / Pots", view.selectedOptions.join(", "))}${row("Amount Paid", formatCurrencyFromCents(view.totalCents))}</table><p style="margin-top:20px;font-size:12px;font-style:italic;color:#666">All tournament times are subject to change by the Tournament Director.</p><h2 style="margin:26px 0 8px;font-size:18px">Tournament Status</h2><p style="font-size:14px;line-height:1.6;color:#333">Check the AITT homepage before the tournament for weather-related postponements, cancellations, or schedule changes. Updates will also be posted on AITT social media.</p><p><a href="${AITT_HOMEPAGE_URL}" target="_blank" rel="noopener noreferrer" style="color:#9b7300;font-weight:700">Check AITT Homepage →</a></p></div></div>`,
  };
}
