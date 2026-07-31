import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let input: { email?: string; firstName?: string };
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 }); }
  const email = input.email?.trim().toLowerCase() ?? "";
  const firstName = input.firstName?.trim().slice(0, 80) || null;
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("registration_interest").upsert(
    { email, first_name: firstName },
    { onConflict: "email", ignoreDuplicates: true },
  );
  return error
    ? NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 503 })
    : NextResponse.json({ ok: true });
}
