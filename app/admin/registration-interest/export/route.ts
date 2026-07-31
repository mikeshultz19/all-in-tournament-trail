import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function csv(value: string) { return `"${value.replaceAll('"', '""')}"`; }

export async function GET() {
  await requireAdminUser();
  const { data, error } = await createSupabaseServerClient().from("registration_interest").select("first_name,email,created_at").order("created_at", { ascending: false });
  if (error) return new Response("Export unavailable.", { status: 503 });
  const body = ["First Name,Email Address,Date Submitted", ...(data ?? []).map((row) => [row.first_name || "", row.email, row.created_at].map(csv).join(","))].join("\r\n");
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="registration-interest.csv"', "cache-control": "no-store" } });
}
