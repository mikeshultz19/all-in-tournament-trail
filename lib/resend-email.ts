import "server-only";

export const AITT_EMAIL_FROM = "All In Tournament Trail <info@allintrail.com>";

export class EmailProviderError extends Error {
  constructor(public readonly code: string) {
    super("Email delivery failed.");
    this.name = "EmailProviderError";
  }
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
}): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new EmailProviderError("RESEND_NOT_CONFIGURED");

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: AITT_EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
  } catch {
    throw new EmailProviderError("RESEND_NETWORK_ERROR");
  }

  if (!response.ok) {
    throw new EmailProviderError(`RESEND_HTTP_${response.status}`);
  }

  const result = (await response.json()) as { id?: unknown };
  if (typeof result.id !== "string" || !result.id) {
    throw new EmailProviderError("RESEND_INVALID_RESPONSE");
  }
  return { id: result.id };
}
