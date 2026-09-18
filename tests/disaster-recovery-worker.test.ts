import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { clearGoogleAccessTokenCache, getGoogleAccessToken, parseServiceAccountJson } from "../lib/disaster-recovery/google-auth";

describe("GitHub Actions disaster-recovery authentication", () => {
  it("requires the corrected server-only secret names and four-hour cron", () => {
    const workflow = readFileSync(".github/workflows/disaster-recovery-staging.yml", "utf8");
    expect(workflow).toContain("AITT_DR_STAGING_ENABLED == 'true'");
    expect(workflow).toContain('cron: "0 */4 * * *"');
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain("environment: aitt-staging-dr");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("scripts/disaster-recovery-sync.ts");
    expect(workflow).not.toContain("qrmnglzylrrdhcvashmx");
    expect(workflow).not.toContain("upload-artifact");
  });

  it("keeps Admin Sync Now disabled while GitHub dispatch is unrehearsed", () => {
    const action = readFileSync("app/admin/registration-review/disaster-recovery-actions.ts", "utf8");
    expect(action).toContain("Sync Now is disabled");
    expect(action).not.toContain("fetch(");
    expect(action).toContain("requireAdminUser");
  });

  it("keeps the GitHub CLI output to sanitized counts and stage codes", () => {
    const cli = readFileSync("scripts/disaster-recovery-sync.ts", "utf8");
    expect(cli).toContain("AITT_DR_STAGING_GOOGLE_SERVICE_ACCOUNT_JSON");
    expect(cli).toContain("BATCH_SIZE = 50");
    expect(cli).toContain("process.exitCode = 1");
    expect(cli).not.toContain("participant_contact_snapshot");
    expect(cli).not.toContain("console.log(serviceAccount)");
  });

  it("exchanges a signed service-account JWT and caches only the short-lived token", async () => {
    const keyPair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
    let binary = ""; for (const byte of pkcs8) binary += String.fromCharCode(byte);
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa(binary).match(/.{1,64}/g)?.join("\n")}\n-----END PRIVATE KEY-----`;
    const serviceAccount = JSON.stringify({ client_email: "staging@example.test", private_key: privateKey, token_uri: "https://oauth.example.test/token" });
    expect(parseServiceAccountJson(serviceAccount).client_email).toBe("staging@example.test");
    let calls = 0;
    const fetchMock: typeof fetch = async (_input, init) => { calls += 1; expect(init?.method).toBe("POST"); expect(String(init?.body)).toContain("jwt-bearer"); return new Response(JSON.stringify({ access_token: "temporary-token", expires_in: 3600 }), { status: 200 }); };
    clearGoogleAccessTokenCache();
    expect(await getGoogleAccessToken(serviceAccount, fetchMock, 1_000_000)).toBe("temporary-token");
    expect(await getGoogleAccessToken(serviceAccount, fetchMock, 1_100_000)).toBe("temporary-token");
    expect(calls).toBe(1);
  });
});
