import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let input: { email?: string; firstName?: string };

  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const email = input.email?.trim().toLowerCase() ?? "";
  const firstName = input.firstName?.trim().slice(0, 80) || null;

  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("registration_interest").upsert(
    {
      email,
      first_name: firstName,
    },
    {
      onConflict: "email",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 503 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const greeting = firstName
        ? `Hi ${firstName},`
        : "Welcome to All In Tournament Trail,";

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "All In Tournament Trail <info@allintrail.com>",
          to: [email],
          subject: "Welcome to All In Tournament Trail",
          html: `
            <div style="background:#ffffff;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
              <div style="max-width:600px;margin:0 auto;">
                <h1 style="margin:0 0 24px;color:#111111;font-size:26px;">
                  All In Tournament Trail
                </h1>

                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
                  ${greeting}
                </p>

                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#333333;">
                  You're on the AITT notification list.
                </p>

                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#333333;">
                  We'll keep you updated with tournament announcements,
                  registration information, schedule updates, and other
                  important All In Tournament Trail news.
                </p>

                <p style="margin:28px 0 0;font-size:18px;font-weight:bold;color:#d4a017;">
                  Fish Your Way. Win Your Way.
                </p>

                <p style="margin:8px 0 0;font-size:14px;color:#777777;">
                  All In Tournament Trail
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        console.error(
          "Resend confirmation email failed:",
          await resendResponse.text(),
        );
      }
    } catch (emailError) {
      console.error("Resend confirmation email error:", emailError);
    }
  } else {
    console.warn(
      "RESEND_API_KEY is not configured. Confirmation email was not sent.",
    );
  }

  return NextResponse.json({ ok: true });
}